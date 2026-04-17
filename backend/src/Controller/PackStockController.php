<?php

namespace App\Controller;

use App\Entity\Pack;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class PackStockController extends AbstractController
{
    #[Route('/api/packs/{id}/decrement_stock', name: 'api_pack_decrement_stock', methods: ['POST'], priority: 10)]
    public function decrementStock(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        $pack = $em->getRepository(Pack::class)->find($id);
        if (!$pack) {
            return $this->json(['error' => 'Pack no encontrado'], 404);
        }

        $data = json_decode($request->getContent() ?: '{}', true);
        $cantidad = isset($data['cantidad']) ? (int) $data['cantidad'] : 1;
        if ($cantidad <= 0) {
            return $this->json(['error' => 'Cantidad inválida'], 400);
        }

        $stockActual = $pack->getStock() ?? 0;
        $nuevoStock = max(0, $stockActual - $cantidad);
        $pack->setStock($nuevoStock);

        $em->persist($pack);
        $em->flush();

        return $this->json(['id' => $pack->getId(), 'stock' => $pack->getStock()], 200);
    }
}

