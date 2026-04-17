<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\ValoracionTrabajadorRepository;
use App\State\ValoracionTrabajadorProcessor;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ValoracionTrabajadorRepository::class)]
#[ApiFilter(SearchFilter::class, properties: ['trabajador' => 'exact'])]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(processor: ValoracionTrabajadorProcessor::class, security: "is_granted('ROLE_USER')"),
        new Patch(
            processor: ValoracionTrabajadorProcessor::class,
            security: "is_granted('ROLE_USER') and object.getUsuario() != null and object.getUsuario().getId() == user.getId()",
            denormalizationContext: ['groups' => ['valoracion_trabajador:patch']],
        ),
        new Delete(
            security: "is_granted('ROLE_USER') and object.getUsuario() != null and object.getUsuario().getId() == user.getId()",
        ),
    ],
    normalizationContext: ['groups' => ['valoracion_trabajador:read']],
    denormalizationContext: ['groups' => ['valoracion_trabajador:write']],
)]
class ValoracionTrabajador
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['valoracion_trabajador:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['valoracion_trabajador:read'])]
    private ?User $usuario = null;

    #[ORM\ManyToOne(inversedBy: 'valoracionTrabajadors')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['valoracion_trabajador:write'])]
    private ?Trabajador $trabajador = null;

    #[ORM\Column]
    #[Groups(['valoracion_trabajador:read', 'valoracion_trabajador:write', 'valoracion_trabajador:patch'])]
    private ?int $estrellas = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['valoracion_trabajador:read', 'valoracion_trabajador:write', 'valoracion_trabajador:patch'])]
    private ?string $comentario = null;

    #[ORM\Column]
    #[Groups(['valoracion_trabajador:read'])]
    private ?\DateTime $fecha = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsuario(): ?User
    {
        return $this->usuario;
    }

    public function setUsuario(?User $usuario): static
    {
        $this->usuario = $usuario;
        return $this;
    }

    public function getTrabajador(): ?Trabajador
    {
        return $this->trabajador;
    }

    public function setTrabajador(?Trabajador $trabajador): static
    {
        $this->trabajador = $trabajador;
        return $this;
    }

    public function getEstrellas(): ?int
    {
        return $this->estrellas;
    }

    public function setEstrellas(int $estrellas): static
    {
        $this->estrellas = $estrellas;
        return $this;
    }

    public function getComentario(): ?string
    {
        return $this->comentario;
    }

    public function setComentario(string $comentario): static
    {
        $this->comentario = $comentario;
        return $this;
    }

    public function getFecha(): ?\DateTime
    {
        return $this->fecha;
    }

    public function setFecha(\DateTime $fecha): static
    {
        $this->fecha = $fecha;
        return $this;
    }
}
