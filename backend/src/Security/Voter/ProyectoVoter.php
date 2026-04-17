<?php

namespace App\Security\Voter;

use App\Entity\Proyecto;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * ProyectoVoter — Controla quién puede modificar o eliminar un Proyecto.
 *
 * Atributos que gestiona:
 *  - PROYECTO_EDIT   → editar un proyecto existente (PUT / PATCH)
 *  - PROYECTO_DELETE → eliminar un proyecto (DELETE)
 *
 * Reglas de negocio:
 *  1. ROLE_ADMIN  → SIEMPRE puede editar/eliminar CUALQUIER proyecto.
 *  2. ROLE_TRABAJADOR → SOLO puede editar/eliminar proyectos de los que él es autor.
 *  3. Cualquier otro caso   → DENEGADO.
 */
class ProyectoVoter extends Voter
{
    // ── Constantes de atributo ──────────────────────────────────────────────
    public const EDIT   = 'PROYECTO_EDIT';
    public const DELETE = 'PROYECTO_DELETE';

    // ── supports() — ¿Este Voter debe votar sobre esta combinación? ─────────
    protected function supports(string $attribute, mixed $subject): bool
    {
        // Solo actuamos si el atributo es nuestro Y el sujeto es un Proyecto
        return in_array($attribute, [self::EDIT, self::DELETE], true)
            && $subject instanceof Proyecto;
    }

    // ── voteOnAttribute() — La lógica real de acceso ────────────────────────
    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        /** @var User|null $user */
        $user = $token->getUser();

        // Si no hay usuario autenticado, denegar siempre
        if (!$user instanceof User) {
            return false;
        }

        /** @var Proyecto $proyecto */
        $proyecto = $subject;

        // ── REGLA 1: ROLE_ADMIN puede todo ──────────────────────────────────
        // Nota: en tu security.yaml, ROLE_ADMIN hereda de ROLE_USER,
        // but NOT de ROLE_TRABAJADOR, así que comprobamos explícitamente.
        if ($user->isAdmin()) {
            return true;
        }

        // ── REGLA 2: El autor del proyecto puede editarlo/eliminarlo ─────────
        // Navegamos: Proyecto → Autor(Trabajador) → Usuario → ID
        $autorUser = $proyecto->getAutor()?->getUsuario();

        if ($autorUser === null) {
            // Proyecto sin autor asignado: denegar por seguridad
            return false;
        }

        // Comparamos por ID (evita problemas con proxies de Doctrine)
        return $autorUser->getId() === $user->getId();
    }
}
