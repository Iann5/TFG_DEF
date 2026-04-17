<?php

namespace App\EventListener;

use App\Entity\LineaPedido;
use App\Entity\Producto;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Events;

#[AsEntityListener(event: Events::prePersist, method: 'prePersist', entity: LineaPedido::class)]
class LineaPedidoStockListener
{
    public function prePersist(LineaPedido $linea, PrePersistEventArgs $event): void
    {
        $producto = $linea->getProducto();
        $cantidad = $linea->getCantidad() ?? 0;

        if (!$producto instanceof Producto || $cantidad <= 0) {
            return;
        }

        $stockActual = $producto->getStock() ?? 0;
        $nuevoStock = max(0, $stockActual - $cantidad);
        $producto->setStock($nuevoStock);

        $em = $event->getObjectManager();
        if ($em instanceof EntityManagerInterface) {
            $uow = $em->getUnitOfWork();
            $uow->recomputeSingleEntityChangeSet($em->getClassMetadata(Producto::class), $producto);
        }
    }
}

