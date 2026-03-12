<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\CitaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CitaRepository::class)]
#[ApiFilter(SearchFilter::class, properties: ['trabajador' => 'exact', 'fecha' => 'exact', 'usuario' => 'exact'])]
#[ApiResource(
    normalizationContext: ['groups' => ['cita:read']]
)]
class Cita
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['cita:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['cita:read'])]
    private ?User $usuario = null;

    #[ORM\ManyToOne(inversedBy: 'citas')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['cita:read'])]
    private ?Trabajador $trabajador = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['cita:read'])]
    private ?\DateTime $fecha = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    #[Groups(['cita:read'])]
    private ?\DateTime $hora_inicio = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    #[Groups(['cita:read'])]
    private ?\DateTime $hora_fin = null;

    #[ORM\Column(length: 50)]
    #[Groups(['cita:read'])]
    private ?string $tipo_cita = null;

    #[ORM\Column(length: 50)]
    #[Groups(['cita:read'])]
    private ?string $estado = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['cita:read'])]
    private ?float $precio_total = null;

    /**
     * @var Collection<int, Proyecto>
     */
    #[ORM\ManyToMany(targetEntity: Proyecto::class, inversedBy: 'citas')]
    #[Groups(['cita:read'])]
    private Collection $proyectos;

    /**
     * @var Collection<int, Pack>
     */
    #[ORM\ManyToMany(targetEntity: Pack::class, inversedBy: 'citas')]
    #[Groups(['cita:read'])]
    private Collection $packs;

    public function __construct()
    {
        $this->proyectos = new ArrayCollection();
        $this->packs = new ArrayCollection();
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

    public function getTrabajador(): ?Trabajador
    {
        return $this->trabajador;
    }

    public function setTrabajador(?Trabajador $trabajador): static
    {
        $this->trabajador = $trabajador;

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

    public function getHoraInicio(): ?\DateTime
    {
        return $this->hora_inicio;
    }

    public function setHoraInicio(\DateTime $hora_inicio): static
    {
        $this->hora_inicio = $hora_inicio;

        return $this;
    }

    public function getHoraFin(): ?\DateTime
    {
        return $this->hora_fin;
    }

    public function setHoraFin(\DateTime $hora_fin): static
    {
        $this->hora_fin = $hora_fin;

        return $this;
    }

    public function getTipoCita(): ?string
    {
        return $this->tipo_cita;
    }

    public function setTipoCita(string $tipo_cita): static
    {
        $this->tipo_cita = $tipo_cita;

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

    public function getPrecioTotal(): ?float
    {
        return $this->precio_total;
    }

    public function setPrecioTotal(?float $precio_total): static
    {
        $this->precio_total = $precio_total;

        return $this;
    }

    /**
     * @return Collection<int, Proyecto>
     */
    public function getProyectos(): Collection
    {
        return $this->proyectos;
    }

    public function addProyecto(Proyecto $proyecto): static
    {
        if (!$this->proyectos->contains($proyecto)) {
            $this->proyectos->add($proyecto);
        }

        return $this;
    }

    public function removeProyecto(Proyecto $proyecto): static
    {
        $this->proyectos->removeElement($proyecto);

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
        }

        return $this;
    }

    public function removePack(Pack $pack): static
    {
        $this->packs->removeElement($pack);

        return $this;
    }
}
