<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\Repository\PedidoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PedidoRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['pedido:read']],
    denormalizationContext: ['groups' => ['pedido:write']],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(),
        new Put(),
        new Patch(),
        new Delete(),
    ]
)]
class Pedido
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['pedido:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['pedido:read', 'pedido:write'])]
    private ?User $usuario = null;

    #[ORM\Column(length: 50)]
    #[Groups(['pedido:read', 'pedido:write'])]
    private ?string $metodo_pago = null;

    #[ORM\Column]
    #[Groups(['pedido:read', 'pedido:write'])]
    private ?float $total = null;

    #[ORM\Column]
    #[Groups(['pedido:read', 'pedido:write'])]
    private ?\DateTime $fecha_compra = null;

    #[ORM\Column(length: 100)]
    #[Groups(['pedido:read', 'pedido:write'])]
    private ?string $pais = null;

    #[ORM\Column(length: 255)]
    #[Groups(['pedido:read', 'pedido:write'])]
    private ?string $direccion = null;

    #[ORM\Column(length: 100)]
    #[Groups(['pedido:read', 'pedido:write'])]
    private ?string $provincia = null;

    #[ORM\Column(length: 100)]
    #[Groups(['pedido:read', 'pedido:write'])]
    private ?string $localidad = null;

    #[ORM\Column(length: 20)]
    #[Groups(['pedido:read', 'pedido:write'])]
    private ?string $cp = null;

    #[ORM\Column(length: 50)]
    #[Groups(['pedido:read', 'pedido:write'])]
    private ?string $estado = 'Pendiente';

    /**
     * @var Collection<int, LineaPedido>
     */
    #[ORM\OneToMany(targetEntity: LineaPedido::class, mappedBy: 'pedido')]
    #[Groups(['pedido:read'])]
    private Collection $lineaPedidos;

    public function __construct()
    {
        $this->lineaPedidos = new ArrayCollection();
    }

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

    public function getMetodoPago(): ?string
    {
        return $this->metodo_pago;
    }

    public function setMetodoPago(string $metodo_pago): static
    {
        $this->metodo_pago = $metodo_pago;
        return $this;
    }

    public function getTotal(): ?float
    {
        return $this->total;
    }

    public function setTotal(float $total): static
    {
        $this->total = $total;
        return $this;
    }

    public function getFechaCompra(): ?\DateTime
    {
        return $this->fecha_compra;
    }

    public function setFechaCompra(\DateTime $fecha_compra): static
    {
        $this->fecha_compra = $fecha_compra;
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

    public function getEstado(): ?string
    {
        return $this->estado;
    }

    public function setEstado(string $estado): static
    {
        $this->estado = $estado;
        return $this;
    }

    /**
     * @return Collection<int, LineaPedido>
     */
    public function getLineaPedidos(): Collection
    {
        return $this->lineaPedidos;
    }

    public function addLineaPedido(LineaPedido $lineaPedido): static
    {
        if (!$this->lineaPedidos->contains($lineaPedido)) {
            $this->lineaPedidos->add($lineaPedido);
            $lineaPedido->setPedido($this);
        }

        return $this;
    }

    public function removeLineaPedido(LineaPedido $lineaPedido): static
    {
        if ($this->lineaPedidos->removeElement($lineaPedido)) {
            
            if ($lineaPedido->getPedido() === $this) {
                $lineaPedido->setPedido(null);
            }
        }

        return $this;
    }
}
