<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\ValoracionPack;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;

class ValoracionPackProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly ProcessorInterface $inner,
        private readonly Security $security,
    ) {
    }

    /**
     * @param ValoracionPack $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if ($data instanceof ValoracionPack) {
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
