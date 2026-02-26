<?php

namespace App\Controller;

use App\Entity\Trabajador;
use App\Repository\TrabajadorRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoint público para la página de Equipo.
 * Devuelve los trabajadores con datos aplanados (nombre desde usuario).
 */
#[Route('/api/equipo', name: 'api_equipo', methods: ['GET'])]
class EquipoController extends AbstractController
{
    public function __invoke(TrabajadorRepository $repo): JsonResponse
    {
        /** @var Trabajador[] $trabajadores */
        $trabajadores = $repo->findAll();

        $data = array_map(function (Trabajador $t) {
            $u = $t->getUsuario();
            return [
                'id' => $t->getId(),
                'nombre' => $u ? trim($u->getNombre() . ' ' . $u->getApellidos()) : 'Sin nombre',
                'descripcion' => $t->getDescripcion() ?? '',
                'imagen' => $u?->getFotoPerfil(),
                'estilos' => $t->getEstilos()->map(
                    fn($e) => ['id' => $e->getId(), 'nombre' => $e->getNombre()]
                )->getValues(),
            ];
        }, $trabajadores);

        return $this->json($data);
    }
}
