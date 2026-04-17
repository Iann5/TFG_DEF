<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\Repository\LineaPedidoRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: LineaPedidoRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['linea_pedido:read']],
    denormalizationContext: ['groups' => ['linea_pedido:write']],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(),
        new Put(),
        new Patch(),
        new Delete(),
    ]
)]
class LineaPedido
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['linea_pedido:read', 'pedido:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['linea_pedido:read', 'linea_pedido:write', 'pedido:read'])]
    private ?User $usuario = null;

    #[ORM\ManyToOne(inversedBy: 'lineaPedidos')]
    #[Groups(['linea_pedido:read', 'linea_pedido:write', 'pedido:read'])]
    private ?Producto $producto = null;

    #[ORM\ManyToOne(inversedBy: 'lineaPedidos')]
    #[Groups(['linea_pedido:read', 'linea_pedido:write'])]
    private ?Pedido $pedido = null;

    #[ORM\Column]
    #[Groups(['linea_pedido:read', 'linea_pedido:write', 'pedido:read'])]
    private ?int $cantidad = null;

    #[ORM\Column]
    #[Groups(['linea_pedido:read', 'linea_pedido:write', 'pedido:read'])]
    private ?float $precio = null;

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

    public function getPedido(): ?Pedido
    {
        return $this->pedido;
    }

    public function setPedido(?Pedido $pedido): static
    {
        $this->pedido = $pedido;
        return $this;
    }

    public function getCantidad(): ?int
    {
        return $this->cantidad;
    }

    public function setCantidad(int $cantidad): static
    {
        $this->cantidad = $cantidad;
        return $this;
    }

    public function getPrecio(): ?float
    {
        return $this->precio;
    }

    public function setPrecio(float $precio): static
    {
        $this->precio = $precio;
        return $this;
    }
}
