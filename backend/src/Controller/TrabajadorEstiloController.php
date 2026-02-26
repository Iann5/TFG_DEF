<?php

namespace App\Controller;

use App\Entity\Estilo;
use App\Entity\Trabajador;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/**
 * Gestión de la relación ManyToMany Trabajador <-> Estilo.
 * Rutas limpias sin depender de PATCH de API Platform.
 */
#[Route('/api/trabajador/estilos', name: 'trabajador_estilos_')]
class TrabajadorEstiloController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em)
    {
    }

    /** Añade un estilo al trabajador autenticado */
    #[Route('/add/{estiloId}', name: 'add', methods: ['POST'])]
    public function add(int $estiloId, #[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user)
            return $this->json(['error' => 'No autenticado'], 401);

        $trabajador = $user->getTrabajador();
        if (!$trabajador)
            return $this->json(['error' => 'No es trabajador'], 403);

        $estilo = $this->em->getRepository(Estilo::class)->find($estiloId);
        if (!$estilo)
            return $this->json(['error' => 'Estilo no encontrado'], 404);

        $trabajador->addEstilo($estilo);
        $this->em->flush();

        return $this->json(['ok' => true, 'estilos' => $this->mapEstilos($trabajador)]);
    }

    /** Elimina un estilo del trabajador autenticado */
    #[Route('/remove/{estiloId}', name: 'remove', methods: ['DELETE'])]
    public function remove(int $estiloId, #[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user)
            return $this->json(['error' => 'No autenticado'], 401);

        $trabajador = $user->getTrabajador();
        if (!$trabajador)
            return $this->json(['error' => 'No es trabajador'], 403);

        $estilo = $this->em->getRepository(Estilo::class)->find($estiloId);
        if (!$estilo)
            return $this->json(['error' => 'Estilo no encontrado'], 404);

        $trabajador->removeEstilo($estilo);
        $this->em->flush();

        return $this->json(['ok' => true, 'estilos' => $this->mapEstilos($trabajador)]);
    }

    /** Actualiza las fotos de ejemplo de un estilo (máx. 3) — solo el trabajador especializado */
    #[Route('/{estiloId}/fotos', name: 'fotos', methods: ['PUT'])]
    public function updateFotos(int $estiloId, Request $request, #[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user)
            return $this->json(['error' => 'No autenticado'], 401);

        $trabajador = $user->getTrabajador();
        if (!$trabajador)
            return $this->json(['error' => 'No es trabajador'], 403);

        $estilo = $this->em->getRepository(Estilo::class)->find($estiloId);
        if (!$estilo)
            return $this->json(['error' => 'Estilo no encontrado'], 404);

        // Solo trabajadores especializados en ese estilo pueden subir fotos
        if (!$trabajador->getEstilos()->contains($estilo)) {
            return $this->json(['error' => 'No estás especializado en este estilo'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $fotos = array_slice($data['imagenes'] ?? [], 0, 3); // máx 3
        $estilo->setImagenes($fotos);
        $this->em->flush();

        return $this->json(['ok' => true, 'imagenes' => $fotos]);
    }

    private function mapEstilos(Trabajador $t): array
    {
        return $t->getEstilos()->map(
            fn($e) => ['id' => $e->getId(), 'nombre' => $e->getNombre()]
        )->getValues();
    }
}
