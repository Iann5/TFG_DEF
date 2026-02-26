<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Proyecto;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ProyectoProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly ProcessorInterface $inner,
        private readonly Security $security,
        private readonly EntityManagerInterface $em,
    ) {}

    /**
     * @param Proyecto $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if ($data instanceof Proyecto) {
            /** @var User|null $user */
            $user = $this->security->getUser();

            if ($user instanceof User && $data->getAutor() === null) {
                $trabajador = $user->getTrabajador();

                if ($trabajador === null) {
                    throw new UnprocessableEntityHttpException(
                        'El usuario autenticado no tiene un perfil de trabajador asociado.'
                    );
                }

                $data->setAutor($trabajador);
            }
        }

        return $this->inner->process($data, $operation, $uriVariables, $context);
    }
}
