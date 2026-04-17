<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use App\State\UserPasswordHasher;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ApiResource(
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:write']],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(),
        new Put(),
        new Patch(),
        new Delete(),
    ]
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'valoracion_proyecto:read', 'valoracion_trabajador:read', 'valoracion_producto:read', 'valoracion_pack:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Groups(['valoracion_proyecto:read', 'valoracion_trabajador:read', 'valoracion_producto:read', 'valoracion_pack:read', 'trabajador:read', 'user:read', 'user:write'])]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups(['user:read', 'user:write', 'trabajador:read', 'proyecto:read'])]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    #[Groups(['user:write'])]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    #[Groups(['valoracion_proyecto:read', 'valoracion_trabajador:read', 'valoracion_producto:read', 'valoracion_pack:read', 'trabajador:read', 'proyecto:read', 'cita:read', 'producto:read', 'user:read', 'user:write'])]
    private ?string $nombre = null;

    #[ORM\Column(length: 255)]
    #[Groups(['valoracion_proyecto:read', 'valoracion_trabajador:read', 'valoracion_producto:read', 'valoracion_pack:read', 'trabajador:read', 'proyecto:read', 'cita:read', 'producto:read', 'user:read', 'user:write'])]
    private ?string $apellidos = null;

    #[ORM\Column(length: 20)]
    #[Groups(['user:read', 'user:write'])]
    private ?string $dni = null;

    #[ORM\Column(length: 20)]
    #[Groups(['valoracion_proyecto:read', 'valoracion_trabajador:read', 'valoracion_producto:read', 'valoracion_pack:read', 'trabajador:read', 'user:write'])]
    private ?string $telefono = null;

    #[ORM\Column(length: 100)]
    #[Groups(['user:write'])]
    private ?string $pais = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:write'])]
    private ?string $direccion = null;

    #[ORM\Column(length: 100)]
    #[Groups(['user:write'])]
    private ?string $provincia = null;

    #[ORM\Column(length: 100)]
    #[Groups(['user:write'])]
    private ?string $localidad = null;

    #[ORM\Column(length: 10)]
    #[Groups(['user:write'])]
    private ?string $cp = null;

    #[ORM\Column(type: 'text', length: 4294967295, nullable: true)]
    #[Groups(['valoracion_proyecto:read', 'valoracion_trabajador:read', 'valoracion_producto:read', 'valoracion_pack:read', 'trabajador:read', 'user:write'])]
    private ?string $foto_perfil = null;

    #[ORM\Column]
    #[Groups(['user:write'])]
    private ?\DateTime $fecha_registro = null;

    #[ORM\OneToOne(mappedBy: 'usuario', cascade: ['persist', 'remove'])]
    private ?Trabajador $trabajador = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     * 
     * Roles disponibles:
     * - ROLE_USER: Rol base para todos los usuarios
     * - ROLE_ADMIN: Administrador del sistema
     * - ROLE_TRABAJADOR: Trabajador/Artesano
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // todos los usuarios creados tienen el rol de ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    public function addRole(string $role): static
    {
        if (!in_array($role, $this->roles)) {
            $this->roles[] = $role;
        }

        return $this;
    }

    public function removeRole(string $role): static
    {
        $this->roles = array_filter($this->roles, fn(string $r) => $r !== $role);

        return $this;
    }

    public function hasRole(string $role): bool
    {
        return in_array($role, $this->getRoles());
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('ROLE_ADMIN');
    }

    public function isTrabajador(): bool
    {
        return $this->hasRole('ROLE_TRABAJADOR');
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * Asegurarse de que la sesión no contenga los hashes reales de las contraseñas
     */
    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0" . self::class . "\0password"] = hash('crc32c', $this->password);

        return $data;
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // @deprecated
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
    {
        $this->nombre = $nombre;

        return $this;
    }

    public function getApellidos(): ?string
    {
        return $this->apellidos;
    }

    public function setApellidos(string $apellidos): static
    {
        $this->apellidos = $apellidos;

        return $this;
    }

    public function getDni(): ?string
    {
        return $this->dni;
    }

    public function setDni(string $dni): static
    {
        $this->dni = $dni;

        return $this;
    }

    public function getTelefono(): ?string
    {
        return $this->telefono;
    }

    public function setTelefono(string $telefono): static
    {
        $this->telefono = $telefono;

        return $this;
    }

    public function getPais(): ?string
    {
        return $this->pais;
    }

    public function setPais(string $pais): static
    {
        $this->pais = $pais;

        return $this;
    }

    public function getDireccion(): ?string
    {
        return $this->direccion;
    }

    public function setDireccion(string $direccion): static
    {
        $this->direccion = $direccion;

        return $this;
    }

    public function getProvincia(): ?string
    {
        return $this->provincia;
    }

    public function setProvincia(string $provincia): static
    {
        $this->provincia = $provincia;

        return $this;
    }

    public function getLocalidad(): ?string
    {
        return $this->localidad;
    }

    public function setLocalidad(string $localidad): static
    {
        $this->localidad = $localidad;

        return $this;
    }

    public function getCp(): ?string
    {
        return $this->cp;
    }

    public function setCp(string $cp): static
    {
        $this->cp = $cp;

        return $this;
    }

    public function getFotoPerfil(): ?string
    {
        return $this->foto_perfil;
    }

    public function setFotoPerfil(?string $foto_perfil): static
    {
        $this->foto_perfil = $foto_perfil;

        return $this;
    }

    public function getFechaRegistro(): ?\DateTime
    {
        return $this->fecha_registro;
    }

    public function setFechaRegistro(\DateTime $fecha_registro): static
    {
        $this->fecha_registro = $fecha_registro;

        return $this;
    }

    public function getTrabajador(): ?Trabajador
    {
        return $this->trabajador;
    }

    public function setTrabajador(?Trabajador $trabajador): static
    {
        // Establece el lado propietario de la relación si fuera necesario.
        if ($trabajador !== null && $trabajador->getUsuarioId() !== $this) {
            $trabajador->setUsuarioId($this);
        }

        $this->trabajador = $trabajador;

        return $this;
    }
}
