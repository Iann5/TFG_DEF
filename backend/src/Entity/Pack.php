<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\PackRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PackRepository::class)]
#[ApiFilter(SearchFilter::class, properties: ['creador' => 'exact'])]
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

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $imagenes = null;

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

    /**
     * @var Collection<int, ValoracionPack>
     */
    #[ORM\OneToMany(mappedBy: 'pack', targetEntity: ValoracionPack::class, orphanRemoval: true)]
    #[Groups(['pack:read'])]
    private Collection $valoracionPacks;

    /**
     * @var Collection<int, Cita>
     */
    #[ORM\ManyToMany(targetEntity: Cita::class, mappedBy: 'packs')]
    private Collection $citas;

    // Añade la fecha de forma automática
    public function __construct()
    {
        $this->fecha_subida = new \DateTime();
        $this->valoracionPacks = new ArrayCollection();
        $this->citas = new ArrayCollection();
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

    public function getImagenes(): ?array
    {
        return $this->imagenes;
    }

    public function setImagenes(?array $imagenes): static
    {
        $this->imagenes = $imagenes;

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

    /**
     * @return Collection<int, ValoracionPack>
     */
    public function getValoracionPacks(): Collection
    {
        return $this->valoracionPacks;
    }

    public function addValoracionPack(ValoracionPack $valoracionPack): static
    {
        if (!$this->valoracionPacks->contains($valoracionPack)) {
            $this->valoracionPacks->add($valoracionPack);
            $valoracionPack->setPack($this);
        }

        return $this;
    }

    public function removeValoracionPack(ValoracionPack $valoracionPack): static
    {
        if ($this->valoracionPacks->removeElement($valoracionPack)) {
            // set the owning side to null (unless already changed)
            if ($valoracionPack->getPack() === $this) {
                $valoracionPack->setPack(null);
            }
        }

        return $this;
    }

    #[Groups(['pack:read'])]
    public function getMedia(): ?float
    {
        if ($this->valoracionPacks->isEmpty()) {
            return null;
        }

        $suma = 0;
        foreach ($this->valoracionPacks as $valoracion) {
            $suma += $valoracion->getEstrellas();
        }

        return $suma / $this->valoracionPacks->count();
    }

    // envia el usuario del ID a React
    #[Groups(['pack:read'])]
    public function getCreadorUserId(): ?int
    {
        return $this->creador?->getUsuario()?->getId();
    }

    /**
     * @return Collection<int, Cita>
     */
    public function getCitas(): Collection
    {
        return $this->citas;
    }

    public function addCita(Cita $cita): static
    {
        if (!$this->citas->contains($cita)) {
            $this->citas->add($cita);
            $cita->addPack($this);
        }

        return $this;
    }

    public function removeCita(Cita $cita): static
    {
        if ($this->citas->removeElement($cita)) {
            $cita->removePack($this);
        }

        return $this;
    }
}
