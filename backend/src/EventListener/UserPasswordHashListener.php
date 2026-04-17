<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsEntityListener(event: Events::prePersist, method: 'prePersist', entity: User::class)]
#[AsEntityListener(event: Events::preUpdate, method: 'preUpdate', entity: User::class)]
class UserPasswordHashListener
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function prePersist(User $user, PrePersistEventArgs $event): void
    {
        $this->assignDefaultRole($user);
        $this->assignFechaRegistroIfMissing($user);
        $this->hashPassword($user);
        $this->createTrabajadorProfileIfNeeded($user, $event->getObjectManager());
    }

    public function preUpdate(User $user, PreUpdateEventArgs $event): void
    {
        if ($event->hasChangedField('password')) {
            $this->hashPassword($user);
        }

        if ($event->hasChangedField('roles')) {
            $this->createTrabajadorProfileIfNeeded($user, $event->getObjectManager());
        }
    }

    private function createTrabajadorProfileIfNeeded(User $user, \Doctrine\Persistence\ObjectManager $em): void
    {
        if (in_array('ROLE_TRABAJADOR', $user->getRoles()) && !$user->getTrabajador()) {
            $trabajador = new \App\Entity\Trabajador();
            $trabajador->setDescripcion('¡Hola! Soy un nuevo artista en el estudio.');
            $user->setTrabajador($trabajador);

            $em->persist($trabajador);
            
            if ($em instanceof \Doctrine\ORM\EntityManagerInterface) {
                $uow = $em->getUnitOfWork();
                $uow->computeChangeSet($em->getClassMetadata(\App\Entity\Trabajador::class), $trabajador);
                
                // El usuario se está actualizando/persistiendo actualmente, recalculamos su conjunto de cambios
                // para que UnitOfWork detecte la nueva relación en los eventos preUpdate.
                if ($uow->getEntityState($user) === \Doctrine\ORM\UnitOfWork::STATE_MANAGED) {
                    $uow->recomputeSingleEntityChangeSet($em->getClassMetadata(User::class), $user);
                }
            }
        }
    }

    private function hashPassword(User $user): void
    {
        if (!$user->getPassword()) {
            return;
        }

        $hashed = $this->passwordHasher->hashPassword(
            $user,
            $user->getPassword()
        );
        
        $user->setPassword($hashed);
    }

    private function assignDefaultRole(User $user): void
    {
        $roles = $user->getRoles();
        
        // Si el usuario no tiene ningún rol, asignar ROLE_USER por defecto
        if (empty($roles) || (count($roles) === 1 && in_array('ROLE_USER', $roles))) {
            $user->setRoles(['ROLE_USER']);
        }
    }

    private function assignFechaRegistroIfMissing(User $user): void
    {
        if ($user->getFechaRegistro() === null) {
            $user->setFechaRegistro(new \DateTime());
        }
    }
}