<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PackRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PackRepository::class)]
#[ApiResource]
class Pack
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'packs')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Trabajador $creador = null;

    #[ORM\ManyToOne(inversedBy: 'packs')]
    private ?Producto $producto = null;

    #[ORM\ManyToOne(inversedBy: 'packs')]
    private ?Proyecto $proyecto = null;

    #[ORM\Column(length: 255)]
    private ?string $titulo = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $descripcion = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $imagen = null;

    #[ORM\Column]
    private ?float $precio_original = null;

    #[ORM\Column(length: 50)]
    private ?string $tipo_pack = null;

    #[ORM\Column(nullable: true)]
    private ?float $precio_oferta = null;

    #[ORM\Column]
    private ?int $stock = null;

    #[ORM\Column]
    private ?int $cantidad = null;

    #[ORM\Column]
    private ?\DateTime $fecha_subida = null;

    // Añade la fecha de forma automática
    public function __construct()
    {
        $this->fecha_subida = new \DateTime();
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

    public function getProducto(): ?Producto
    {
        return $this->producto;
    }

    public function setProducto(?Producto $producto): static
    {
        $this->producto = $producto;

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

    public function getTitulo(): ?string
    {
        return $this->titulo;
    }

    public function setTitulo(string $titulo): static
    {
        $this->titulo = $titulo;

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

    public function getTipoPack(): ?string
    {
        return $this->tipo_pack;
    }

    public function setTipoPack(string $tipo_pack): static
    {
        $this->tipo_pack = $tipo_pack;

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

    public function getCantidad(): ?int
    {
        return $this->cantidad;
    }

    public function setCantidad(int $cantidad): static
    {
        $this->cantidad = $cantidad;

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
}
