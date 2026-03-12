<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\ProyectoRepository;
use App\State\ProyectoProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ProyectoRepository::class)]
#[ApiFilter(SearchFilter::class, properties: ['autor' => 'exact', 'tipo' => 'exact'])]
#[ApiResource(
    normalizationContext: ['groups' => ['proyecto:read']],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(processor: ProyectoProcessor::class),
        new Put(processor: ProyectoProcessor::class),
        new Patch(processor: ProyectoProcessor::class),
        new Delete(),
    ]
)]
class Proyecto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['proyecto:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'proyectos')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['proyecto:read'])]
    private ?Trabajador $autor = null;

    #[ORM\ManyToOne(inversedBy: 'proyectos')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['proyecto:read'])]
    private ?Estilo $estilo = null;

    #[ORM\Column(length: 255)]
    #[Groups(['proyecto:read'])]
    private ?string $nombre = null;

    #[ORM\Column(length: 50)]
    #[Groups(['proyecto:read'])]
    private ?string $tipo = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['proyecto:read'])]
    private ?string $imagen = null;

    #[ORM\Column]
    #[Groups(['proyecto:read'])]
    private ?float $precio_original = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['proyecto:read'])]
    private ?float $precio_oferta = null;

    #[ORM\Column]
    #[Groups(['proyecto:read'])]
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
    #[Groups(['proyecto:read'])]
    private Collection $valoracionProyectos;

    /**
     * @var Collection<int, Cita>
     */
    #[ORM\ManyToMany(targetEntity: Cita::class, mappedBy: 'proyectos')]
    private Collection $citas;

    public function __construct()
    {
        $this->packs = new ArrayCollection();
        $this->valoracionProyectos = new ArrayCollection();
        $this->citas = new ArrayCollection();
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

    #[Groups(['proyecto:read'])]
    public function getMedia(): float
    {
        if ($this->valoracionProyectos->isEmpty()) {
            return 0.0;
        }

        $suma = 0;
        foreach ($this->valoracionProyectos as $valoracion) {
            $suma += $valoracion->getEstrellas() ?? 0;
        }

        return $suma / $this->valoracionProyectos->count();
    }

    // envia el usuario del ID a React
    #[Groups(['proyecto:read', 'estilo:read', 'trabajador:read'])]
    public function getAutorUserId(): ?int
    {
        // Esto navega: Proyecto -> Autor(Trabajador) -> Usuario -> ID
        return $this->autor?->getUsuario()?->getId();
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
            $cita->addProyecto($this);
        }

        return $this;
    }

    public function removeCita(Cita $cita): static
    {
        if ($this->citas->removeElement($cita)) {
            $cita->removeProyecto($this);
        }

        return $this;
    }
}
