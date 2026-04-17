<?php

namespace App\EventListener;

use App\Entity\Pack;
use App\Entity\Proyecto;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PreRemoveEventArgs;
use Doctrine\ORM\Events;

#[AsEntityListener(event: Events::preRemove, method: 'preRemove', entity: Proyecto::class)]
class ProyectoDeleteListener
{
    public function preRemove(Proyecto $proyecto, PreRemoveEventArgs $event): void
    {
        $em = $event->getObjectManager();
        if (!$em instanceof EntityManagerInterface) {
            return;
        }

        $packs = $em->getRepository(Pack::class)->findBy(['proyecto' => $proyecto]);
        foreach ($packs as $pack) {
            $pack->setProyecto(null);
            $em->persist($pack);
        }

        if ($packs !== []) {
            $uow = $em->getUnitOfWork();
            $meta = $em->getClassMetadata(Pack::class);
            foreach ($packs as $pack) {
                $uow->recomputeSingleEntityChangeSet($meta, $pack);
            }
        }
    }
}

