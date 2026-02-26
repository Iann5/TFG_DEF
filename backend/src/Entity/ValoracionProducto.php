<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\ValoracionProductoRepository;
use App\State\ValoracionProductoProcessor;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ValoracionProductoRepository::class)]
#[ApiFilter(SearchFilter::class, properties: ['producto' => 'exact'])]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(processor: ValoracionProductoProcessor::class, security: "is_granted('ROLE_USER')"),
    ],
    normalizationContext: ['groups' => ['valoracion_producto:read']],
    denormalizationContext: ['groups' => ['valoracion_producto:write']],
)]
class ValoracionProducto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['valoracion_producto:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'valoracionProductos')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['valoracion_producto:read'])]
    private ?User $usuario = null;

    #[ORM\ManyToOne(inversedBy: 'valoracionProductos')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['valoracion_producto:write'])]
    private ?Producto $producto = null;

    #[ORM\Column]
    #[Groups(['valoracion_producto:read', 'valoracion_producto:write'])]
    private ?int $estrellas = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['valoracion_producto:read', 'valoracion_producto:write'])]
    private ?string $comentario = null;

    #[ORM\Column]
    #[Groups(['valoracion_producto:read'])]
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

    public function getProducto(): ?Producto
    {
        return $this->producto;
    }

    public function setProducto(?Producto $producto): static
    {
        $this->producto = $producto;

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
