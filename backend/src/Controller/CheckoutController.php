<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

/**
 * CheckoutController — Simula la pasarela de pago para el TFG.
 *
 * Ruta: POST /api/process-payment
 *
 * Recibe un JSON con la estructura:
 * {
 *   "metodo_pago": "tarjeta" | "bizum" | "efectivo",
 *   "total": 99.99,
 *   // Sólo si metodo_pago === "tarjeta":
 *   "numero_tarjeta": "4539578763621486",
 *   "caducidad": "12/26",
 *   "cvc": "123",
 *   "titular": "Juan García",
 *   // Sólo si metodo_pago === "bizum":
 *   "telefono_bizum": "612345678",
 *   "concepto_bizum": "Juan Pedido #42"
 * }
 */
class CheckoutController extends AbstractController
{
    #[Route('/api/process-payment', name: 'api_process_payment', methods: ['POST'])]
    public function processPayment(Request $request, #[CurrentUser] ?User $user): JsonResponse
    {
        // ─────────────────────────────────────────────
        // SEGURIDAD: El usuario debe estar autenticado
        // ─────────────────────────────────────────────
        if (!$user) {
            return $this->json(['success' => false, 'message' => 'No autenticado.'], 401);
        }

        // ─────────────────────────────────────────────
        // Parsear el body JSON
        // ─────────────────────────────────────────────
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['success' => false, 'message' => 'El cuerpo de la solicitud no es un JSON válido.'], 400);
        }

        // ─────────────────────────────────────────────
        // VALIDACIÓN COMÚN: método de pago y total
        // ─────────────────────────────────────────────
        $metodosPermitidos = ['tarjeta', 'bizum', 'efectivo'];
        $metodoPago = $data['metodo_pago'] ?? null;

        if (!in_array($metodoPago, $metodosPermitidos, true)) {
            return $this->json(['success' => false, 'message' => 'Método de pago no válido.'], 400);
        }

        $total = $data['total'] ?? null;
        if (!is_numeric($total) || (float) $total <= 0) {
            return $this->json(['success' => false, 'message' => 'El importe total no es válido.'], 400);
        }

        // ─────────────────────────────────────────────
        // VALIDACIÓN ESPECÍFICA: Tarjeta de crédito/débito
        // ─────────────────────────────────────────────
        if ($metodoPago === 'tarjeta') {
            $errores = $this->validarTarjeta($data);
            if (!empty($errores)) {
                return $this->json(['success' => false, 'message' => implode(' ', $errores)], 422);
            }
        }

        // ─────────────────────────────────────────────
        // VALIDACIÓN ESPECÍFICA: Bizum
        // ─────────────────────────────────────────────
        if ($metodoPago === 'bizum') {
            $errores = $this->validarBizum($data);
            if (!empty($errores)) {
                return $this->json(['success' => false, 'message' => implode(' ', $errores)], 422);
            }
        }

        // ─────────────────────────────────────────────
        // SIMULACIÓN DE LATENCIA DE PASARELA BANCARIA
        // Este sleep() simula el tiempo que tardaría una
        // pasarela real (Redsys, Stripe, etc.) en responder.
        // ─────────────────────────────────────────────
        sleep(2);

        // ─────────────────────────────────────────────
        // RESPUESTA DE ÉXITO
        // En un sistema real, aquí se devolvería el ID
        // de transacción de la pasarela bancaria.
        // ─────────────────────────────────────────────
        $referenciaPago = strtoupper(substr(md5(uniqid((string) $user->getId(), true)), 0, 12));

        return $this->json([
            'success'       => true,
            'message'       => 'Pago procesado correctamente.',
            'metodo_pago'   => $metodoPago,
            'total'         => round((float) $total, 2),
            'referencia'    => $referenciaPago,
            'timestamp'     => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
        ]);
    }

    // ═══════════════════════════════════════════════════════
    // MÉTODOS PRIVADOS DE VALIDACIÓN
    // ═══════════════════════════════════════════════════════

    /**
     * Valida los campos de una tarjeta de crédito/débito.
     * Incluye el algoritmo de Luhn para verificar el número.
     *
     * @return string[] Array de mensajes de error (vacío si todo es válido)
     */
    private function validarTarjeta(array $data): array
    {
        $errores = [];

        // — Número de tarjeta: sólo dígitos, entre 13 y 19 cifras —
        $numero = preg_replace('/\s+/', '', $data['numero_tarjeta'] ?? '');
        if (!preg_match('/^\d{13,19}$/', $numero)) {
            $errores[] = 'El número de tarjeta no tiene el formato correcto.';
        } elseif (!$this->luhnCheck($numero)) {
            $errores[] = 'El número de tarjeta no es válido (Luhn).';
        }

        // — Caducidad: formato MM/AA, no expirada —
        $caducidad = $data['caducidad'] ?? '';
        if (!preg_match('/^(0[1-9]|1[0-2])\/(\d{2})$/', $caducidad, $matches)) {
            $errores[] = 'La fecha de caducidad debe tener el formato MM/AA.';
        } else {
            $mesExp  = (int) $matches[1];
            $anioExp = (int) $matches[2] + 2000;
            $hoy     = new \DateTimeImmutable('first day of this month');
            $expDate = new \DateTimeImmutable("$anioExp-$mesExp-01");
            if ($expDate < $hoy) {
                $errores[] = 'La tarjeta está caducada.';
            }
        }

        // — CVC: exactamente 3 dígitos —
        $cvc = $data['cvc'] ?? '';
        if (!preg_match('/^\d{3}$/', $cvc)) {
            $errores[] = 'El CVC debe tener exactamente 3 dígitos.';
        }

        // — Titular: no vacío, al menos 3 caracteres —
        $titular = trim($data['titular'] ?? '');
        if (mb_strlen($titular) < 3) {
            $errores[] = 'El nombre del titular no es válido.';
        }

        return $errores;
    }

    /**
     * Implementación del Algoritmo de Luhn.
     * Verifica la integridad matemática de un número de tarjeta.
     */
    private function luhnCheck(string $numero): bool
    {
        $suma    = 0;
        $impar  = false;
        $digitos = strrev($numero);

        for ($i = 0; $i < strlen($digitos); $i++) {
            $d = (int) $digitos[$i];
            if ($impar) {
                $d *= 2;
                if ($d > 9) {
                    $d -= 9;
                }
            }
            $suma  += $d;
            $impar = !$impar;
        }

        return ($suma % 10) === 0;
    }

    /**
     * Valida el teléfono y el concepto del pago por Bizum.
     *
     * @return string[] Array de mensajes de error (vacío si todo es válido)
     */
    private function validarBizum(array $data): array
    {
        $errores = [];

        // — Teléfono español: 9 dígitos, empieza por 6 o 7 —
        $telefono = preg_replace('/[\s\-+]/', '', $data['telefono_bizum'] ?? '');
        if (!preg_match('/^[67]\d{8}$/', $telefono)) {
            $errores[] = 'El teléfono de Bizum debe ser un móvil español válido (9 dígitos, empieza por 6 o 7).';
        }

        // — Concepto: no vacío —
        $concepto = trim($data['concepto_bizum'] ?? '');
        if (mb_strlen($concepto) < 3) {
            $errores[] = 'El concepto de Bizum no puede estar vacío.';
        }

        return $errores;
    }
}
