<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Trabajador; // Asegúrate de que esta ruta sea correcta
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class MeController extends AbstractController
{
    // Inyectamos el EntityManager para poder guardar el nuevo trabajador
    public function __construct(private EntityManagerInterface $em)
    {
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(#[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'No autenticado'], 401);
        }

        $trabajador = $user->getTrabajador();

        // --- LÓGICA DE AUTO-CREACIÓN ---
        // Si tiene el rol pero no existe el registro en la tabla trabajador, lo creamos
        if (!$trabajador && in_array('ROLE_TRABAJADOR', $user->getRoles())) {
            $trabajador = new Trabajador();
            
            // IMPORTANTE: Verifica si en tu entidad es setUsuario($user) o setUsuarioId($user)
            // Según tu captura de BD, la relación es con la tabla user, así que debería ser:
            $trabajador->setUsuario($user); 
            
            $trabajador->setDescripcion(''); // Valor por defecto para evitar errores de null

            $this->em->persist($trabajador);
            $this->em->flush(); // Guardamos en la base de datos
        }
        // -------------------------------

        $data = [
            'id' => $user->getId(),
            'email' => $user->getUserIdentifier(),
            'nombre' => $user->getNombre(),
            'apellidos' => $user->getApellidos(),
            'dni' => $user->getDni(),
            'telefono' => $user->getTelefono(),
            'foto_perfil' => $user->getFotoPerfil(),
            'roles' => $user->getRoles(),
        ];

        // Si ahora $trabajador existe (porque ya estaba o porque lo acabamos de crear)
        if ($trabajador) {
            $data['trabajadorId'] = $trabajador->getId();
            $data['descripcion'] = $trabajador->getDescripcion();
            $data['tarifas'] = $trabajador->getTarifas();
            $data['estilos'] = $trabajador->getEstilos()->map(
                fn($e) => ['id' => $e->getId(), 'nombre' => $e->getNombre()]
            )->getValues();
        }

        return $this->json($data);
    }
}