<?php

namespace App\EventListener;

use App\Entity\Cita;
use App\Entity\Pack;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Events;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

#[AsEntityListener(event: Events::prePersist, method: 'prePersist', entity: Cita::class)]
class CitaPackStockListener
{
    public function prePersist(Cita $cita, PrePersistEventArgs $event): void
    {
        $em = $event->getObjectManager();
        if (!$em instanceof EntityManagerInterface) {
            return;
        }

        foreach ($cita->getPacks() as $pack) {
            $tipo = strtolower((string) $pack->getTipoPack());
            $esReservable = str_contains($tipo, 'plantilla') || str_contains($tipo, 'tatuaje');
            if (!$esReservable) {
                continue;
            }

            $stock = $pack->getStock() ?? 0;
            if ($stock <= 0) {
                throw new UnprocessableEntityHttpException(sprintf(
                    'El pack "%s" no tiene stock disponible para nuevas reservas.',
                    (string) $pack->getTitulo()
                ));
            }

            $pack->setStock($stock - 1);
            $em->persist($pack);
            $em->getUnitOfWork()->recomputeSingleEntityChangeSet(
                $em->getClassMetadata(Pack::class),
                $pack
            );
        }
    }
}

