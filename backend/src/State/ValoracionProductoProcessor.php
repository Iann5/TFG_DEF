<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\ValoracionProducto;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;

class ValoracionProductoProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly ProcessorInterface $inner,
        private readonly Security $security,
    ) {
    }

    /**
     * @param ValoracionProducto $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if ($data instanceof ValoracionProducto) {
            /** @var User|null $user */
            $user = $this->security->getUser();

            if ($user instanceof User) {
                $data->setUsuario($user);
            }

            if ($data->getFecha() === null) {
                $data->setFecha(new \DateTime());
            }
        }

        return $this->inner->process($data, $operation, $uriVariables, $context);
    }
}
