<?php

namespace App\State;

use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Put;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Proyecto;
use App\Entity\User;
use App\Security\Voter\ProyectoVoter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * ProyectoProcessor — State Processor para la entidad Proyecto.
 *
 * Responsabilidades:
 *  1. POST (creación): asigna automáticamente el Trabajador autenticado como autor.
 *  2. PUT / PATCH (edición): segunda capa — verifica el Voter antes de persistir.
 *     (API Platform ya evalúa el `security:` del atributo, pero esta comprobación
 *      defensiva protege también si se invoca el processor directamente.)
 *  3. DELETE: la seguridad se delega completamente al Voter vía el atributo `security:`.
 */
class ProyectoProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly ProcessorInterface $inner,
        private readonly Security $security,
        private readonly EntityManagerInterface $em,
        private readonly AuthorizationCheckerInterface $authChecker,
    ) {}

    /**
     * @param Proyecto $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Proyecto) {
            return $this->inner->process($data, $operation, $uriVariables, $context);
        }

        /** @var User|null $user */
        $user = $this->security->getUser();

        // ── CASO 1: POST — Asignar autor automáticamente ─────────────────────
        // Si el proyecto no tiene autor (nueva creación), lo tomamos del usuario
        // autenticado. El `security:` del atributo ya garantiza que sea TRABAJADOR o ADMIN.
        if ($data->getAutor() === null) {
            if (!$user instanceof User) {
                throw new AccessDeniedHttpException('Debes estar autenticado para crear un proyecto.');
            }

            $trabajador = $user->getTrabajador();

            if ($trabajador === null) {
                throw new UnprocessableEntityHttpException(
                    'El usuario autenticado no tiene un perfil de trabajador asociado.'
                );
            }

            $data->setAutor($trabajador);
        }

        // ── CASO 2: PUT / PATCH — Verificar propiedad con el Voter ───────────
        // Esta es una segunda capa defensiva. La primera es el `security:` del
        // atributo en la entidad, que API Platform evalúa ANTES de llegar aquí.
        if ($operation instanceof Put || $operation instanceof Patch) {
            if (!$this->authChecker->isGranted(ProyectoVoter::EDIT, $data)) {
                throw new AccessDeniedHttpException('No tienes permiso para editar este proyecto.');
            }
        }

        return $this->inner->process($data, $operation, $uriVariables, $context);
    }
}
