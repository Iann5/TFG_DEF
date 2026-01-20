<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ProyectoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProyectoRepository::class)]
#[ApiResource]
class Proyecto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'proyectos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Trabajador $autor = null;

    #[ORM\ManyToOne(inversedBy: 'proyectos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Estilo $estilo = null;

    #[ORM\Column(length: 255)]
    private ?string $nombre = null;

    #[ORM\Column(length: 50)]
    private ?string $tipo = null;

    #[ORM\Column(length: 255)]
    private ?string $imagen = null;

    #[ORM\Column]
    private ?float $precio_original = null;

    #[ORM\Column(nullable: true)]
    private ?float $precio_oferta = null;

    #[ORM\Column]
    private ?\DateTime $fecha_subida = null;

    /**
     * @var Collection<int, Pack>
     */
    #[ORM\OneToMany(targetEntity: Pack::class, mappedBy: 'proyecto')]
    private Collection $packs;

    /**
     * @var Collection<int, ValoracionProyecto>
     */
    #[ORM\OneToMany(targetEntity: ValoracionProyecto::class, mappedBy: 'proyecto')]
    private Collection $valoracionProyectos;

    public function __construct()
    {
        $this->packs = new ArrayCollection();
        $this->valoracionProyectos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAutor(): ?Trabajador
    {
        return $this->autor;
    }

    public function setAutor(?Trabajador $autor): static
    {
        $this->autor = $autor;

        return $this;
    }

    public function getEstilo(): ?Estilo
    {
        return $this->estilo;
    }

    public function setEstilo(?Estilo $estilo): static
    {
        $this->estilo = $estilo;

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

    public function getTipo(): ?string
    {
        return $this->tipo;
    }

    public function setTipo(string $tipo): static
    {
        $this->tipo = $tipo;

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
            $pack->setProyecto($this);
        }

        return $this;
    }

    public function removePack(Pack $pack): static
    {
        if ($this->packs->removeElement($pack)) {
            // set the owning side to null (unless already changed)
            if ($pack->getProyecto() === $this) {
                $pack->setProyecto(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ValoracionProyecto>
     */
    public function getValoracionProyectos(): Collection
    {
        return $this->valoracionProyectos;
    }

    public function addValoracionProyecto(ValoracionProyecto $valoracionProyecto): static
    {
        if (!$this->valoracionProyectos->contains($valoracionProyecto)) {
            $this->valoracionProyectos->add($valoracionProyecto);
            $valoracionProyecto->setProyecto($this);
        }

        return $this;
    }

    public function removeValoracionProyecto(ValoracionProyecto $valoracionProyecto): static
    {
        if ($this->valoracionProyectos->removeElement($valoracionProyecto)) {
            // set the owning side to null (unless already changed)
            if ($valoracionProyecto->getProyecto() === $this) {
                $valoracionProyecto->setProyecto(null);
            }
        }

        return $this;
    }
}
