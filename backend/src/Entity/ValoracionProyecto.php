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
use App\Repository\ValoracionProyectoRepository;
use App\State\ValoracionProyectoProcessor;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ValoracionProyectoRepository::class)]
#[ApiFilter(SearchFilter::class, properties: ['proyecto' => 'exact'])]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(processor: ValoracionProyectoProcessor::class, security: "is_granted('ROLE_USER')"),
        new Patch(
            processor: ValoracionProyectoProcessor::class,
            security: "is_granted('ROLE_USER') and object.getUsuario() != null and object.getUsuario().getId() == user.getId()",
            denormalizationContext: ['groups' => ['valoracion_proyecto:patch']],
        ),
        new Delete(
            security: "is_granted('ROLE_USER') and object.getUsuario() != null and object.getUsuario().getId() == user.getId()",
        ),
    ],
    normalizationContext: ['groups' => ['valoracion_proyecto:read']],
    denormalizationContext: ['groups' => ['valoracion_proyecto:write']],
)]
class ValoracionProyecto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['valoracion_proyecto:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['valoracion_proyecto:read'])]
    private ?User $usuario = null;

    #[ORM\ManyToOne(inversedBy: 'valoracionProyectos')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['valoracion_proyecto:write'])]
    private ?Proyecto $proyecto = null;

    #[ORM\Column]
    #[Groups(['valoracion_proyecto:read', 'valoracion_proyecto:write', 'valoracion_proyecto:patch', 'proyecto:read'])]
    private ?int $estrellas = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['valoracion_proyecto:read', 'valoracion_proyecto:write', 'valoracion_proyecto:patch'])]
    private ?string $comentario = null;

    #[ORM\Column]
    #[Groups(['valoracion_proyecto:read'])]
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

    public function getProyecto(): ?Proyecto
    {
        return $this->proyecto;
    }

    public function setProyecto(?Proyecto $proyecto): static
    {
        $this->proyecto = $proyecto;

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
