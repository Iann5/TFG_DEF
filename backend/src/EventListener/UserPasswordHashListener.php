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
        $this->hashPassword($user);
    }

    public function preUpdate(User $user, PreUpdateEventArgs $event): void
    {
        if ($event->hasChangedField('password')) {
            $this->hashPassword($user);
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
}