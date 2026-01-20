<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ProductoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProductoRepository::class)]
#[ApiResource]
class Producto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'productos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Trabajador $creador = null;

    #[ORM\Column(length: 255)]
    private ?string $nombre = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $descripcion = null;

    #[ORM\Column(length: 255)]
    private ?string $imagen = null;

    #[ORM\Column]
    private ?float $precio_original = null;

    #[ORM\Column(nullable: true)]
    private ?float $precio_oferta = null;

    #[ORM\Column]
    private ?int $stock = null;

    #[ORM\Column]
    private ?\DateTime $fecha_subida = null;

    /**
     * @var Collection<int, Pack>
     */
    #[ORM\OneToMany(targetEntity: Pack::class, mappedBy: 'producto')]
    private Collection $packs;

    /**
     * @var Collection<int, ValoracionProducto>
     */
    #[ORM\OneToMany(targetEntity: ValoracionProducto::class, mappedBy: 'producto')]
    private Collection $valoracionProductos;

    /**
     * @var Collection<int, LineaPedido>
     */
    #[ORM\OneToMany(targetEntity: LineaPedido::class, mappedBy: 'producto')]
    private Collection $lineaPedidos;

    public function __construct()
    {
        $this->packs = new ArrayCollection();
        $this->valoracionProductos = new ArrayCollection();
        $this->lineaPedidos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCreador(): ?Trabajador
    {
        return $this->creador;
    }

    public function setCreador(?Trabajador $creador): static
    {
        $this->creador = $creador;

        return $this;
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

    public function getDescripcion(): ?string
    {
        return $this->descripcion;
    }

    public function setDescripcion(string $descripcion): static
    {
        $this->descripcion = $descripcion;

        return $this;
    }

    public function getImagen(): ?string
    {
        return $this->imagen;
    }

    public function setImagen(string $imagen): static
    {
        $this->imagen = $imagen;

        return $this;
    }

    public function getPrecioOriginal(): ?float
    {
        return $this->precio_original;
    }

    public function setPrecioOriginal(float $precio_original): static
    {
        $this->precio_original = $precio_original;

        return $this;
    }

    public function getPrecioOferta(): ?float
    {
        return $this->precio_oferta;
    }

    public function setPrecioOferta(?float $precio_oferta): static
    {
        $this->precio_oferta = $precio_oferta;

        return $this;
    }

    public function getStock(): ?int
    {
        return $this->stock;
    }

    public function setStock(int $stock): static
    {
        $this->stock = $stock;

        return $this;
    }

    public function getFechaSubida(): ?\DateTime
    {
        return $this->fecha_subida;
    }

    public function setFechaSubida(\DateTime $fecha_subida): static
    {
        $this->fecha_subida = $fecha_subida;

        return $this;
    }

    /**
     * @return Collection<int, Pack>
     */
    public function getPacks(): Collection
    {
        return $this->packs;
    }

    public function addPack(Pack $pack): static
    {
        if (!$this->packs->contains($pack)) {
            $this->packs->add($pack);
            $pack->setProducto($this);
        }

        return $this;
    }

    public function removePack(Pack $pack): static
    {
        if ($this->packs->removeElement($pack)) {
            // set the owning side to null (unless already changed)
            if ($pack->getProducto() === $this) {
                $pack->setProducto(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ValoracionProducto>
     */
    public function getValoracionProductos(): Collection
    {
        return $this->valoracionProductos;
    }

    public function addValoracionProducto(ValoracionProducto $valoracionProducto): static
    {
        if (!$this->valoracionProductos->contains($valoracionProducto)) {
            $this->valoracionProductos->add($valoracionProducto);
            $valoracionProducto->setProducto($this);
        }

        return $this;
    }

    public function removeValoracionProducto(ValoracionProducto $valoracionProducto): static
    {
        if ($this->valoracionProductos->removeElement($valoracionProducto)) {
            // set the owning side to null (unless already changed)
            if ($valoracionProducto->getProducto() === $this) {
                $valoracionProducto->setProducto(null);
            }
        }

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
            $lineaPedido->setProducto($this);
        }

        return $this;
    }

    public function removeLineaPedido(LineaPedido $lineaPedido): static
    {
        if ($this->lineaPedidos->removeElement($lineaPedido)) {
            // set the owning side to null (unless already changed)
            if ($lineaPedido->getProducto() === $this) {
                $lineaPedido->setProducto(null);
            }
        }

        return $this;
    }
}
