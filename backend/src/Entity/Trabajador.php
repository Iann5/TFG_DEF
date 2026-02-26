<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\TrabajadorRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: TrabajadorRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['trabajador:read']]
)]
#[ApiFilter(SearchFilter::class, properties: ['usuario.email' => 'exact'])]
class Trabajador
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['trabajador:read'])]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'trabajador', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['trabajador:read', 'proyecto:read'])]
    private ?User $usuario = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['trabajador:read'])]
    private ?string $descripcion = null;

    #[ORM\Column]
    private ?float $tiempo_cm_min = null;

    /**
     * @var Collection<int, Estilo>
     */
    #[ORM\ManyToMany(targetEntity: Estilo::class, inversedBy: 'trabajadores')]
    #[Groups(['trabajador:read'])]
    private Collection $estilos;

    /**
     * @var Collection<int, Proyecto>
     */
    #[ORM\OneToMany(targetEntity: Proyecto::class, mappedBy: 'autor')]
    private Collection $proyectos;

    /**
     * @var Collection<int, Producto>
     */
    #[ORM\OneToMany(targetEntity: Producto::class, mappedBy: 'creador')]
    private Collection $productos;

    /**
     * @var Collection<int, Pack>
     */
    #[ORM\OneToMany(targetEntity: Pack::class, mappedBy: 'creador')]
    private Collection $packs;

    /**
     * @var Collection<int, Cita>
     */
    #[ORM\OneToMany(targetEntity: Cita::class, mappedBy: 'trabajador')]
    private Collection $citas;

    /**
     * @var Collection<int, ValoracionTrabajador>
     */
    #[ORM\OneToMany(targetEntity: ValoracionTrabajador::class, mappedBy: 'trabajador')]
    private Collection $valoracionTrabajadors;

    public function __construct()
    {
        $this->estilos = new ArrayCollection();
        $this->proyectos = new ArrayCollection();
        $this->productos = new ArrayCollection();
        $this->packs = new ArrayCollection();
        $this->citas = new ArrayCollection();
        $this->valoracionTrabajadors = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsuario(): ?User
    {
        return $this->usuario;
    }

    public function setUsuario(User $usuario): static
    {
        $this->usuario = $usuario;

        return $this;
    }

    // Alias para compatibilidad con User::setTrabajador()
    public function getUsuarioId(): ?User
    {
        return $this->usuario;
    }

    public function setUsuarioId(User $usuario): static
    {
        $this->usuario = $usuario;

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

    public function getTiempoCmMin(): ?float
    {
        return $this->tiempo_cm_min;
    }

    public function setTiempoCmMin(float $tiempo_cm_min): static
    {
        $this->tiempo_cm_min = $tiempo_cm_min;

        return $this;
    }

    /**
     * @return Collection<int, Estilo>
     */
    public function getEstilos(): Collection
    {
        return $this->estilos;
    }

    public function addEstilo(Estilo $estilo): static
    {
        if (!$this->estilos->contains($estilo)) {
            $this->estilos->add($estilo);
        }

        return $this;
    }

    public function removeEstilo(Estilo $estilo): static
    {
        $this->estilos->removeElement($estilo);

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
            $proyecto->setAutor($this);
        }

        return $this;
    }

    public function removeProyecto(Proyecto $proyecto): static
    {
        if ($this->proyectos->removeElement($proyecto)) {
            // set the owning side to null (unless already changed)
            if ($proyecto->getAutor() === $this) {
                $proyecto->setAutor(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Producto>
     */
    public function getProductos(): Collection
    {
        return $this->productos;
    }

    public function addProducto(Producto $producto): static
    {
        if (!$this->productos->contains($producto)) {
            $this->productos->add($producto);
            $producto->setCreador($this);
        }

        return $this;
    }

    public function removeProducto(Producto $producto): static
    {
        if ($this->productos->removeElement($producto)) {
            // set the owning side to null (unless already changed)
            if ($producto->getCreador() === $this) {
                $producto->setCreador(null);
            }
        }

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
            $pack->setCreador($this);
        }

        return $this;
    }

    public function removePack(Pack $pack): static
    {
        if ($this->packs->removeElement($pack)) {
            // set the owning side to null (unless already changed)
            if ($pack->getCreador() === $this) {
                $pack->setCreador(null);
            }
        }

        return $this;
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
            $cita->setTrabajador($this);
        }

        return $this;
    }

    public function removeCita(Cita $cita): static
    {
        if ($this->citas->removeElement($cita)) {
            // set the owning side to null (unless already changed)
            if ($cita->getTrabajador() === $this) {
                $cita->setTrabajador(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ValoracionTrabajador>
     */
    public function getValoracionTrabajadors(): Collection
    {
        return $this->valoracionTrabajadors;
    }

    public function addValoracionTrabajador(ValoracionTrabajador $valoracionTrabajador): static
    {
        if (!$this->valoracionTrabajadors->contains($valoracionTrabajador)) {
            $this->valoracionTrabajadors->add($valoracionTrabajador);
            $valoracionTrabajador->setTrabajador($this);
        }

        return $this;
    }

    public function removeValoracionTrabajador(ValoracionTrabajador $valoracionTrabajador): static
    {
        if ($this->valoracionTrabajadors->removeElement($valoracionTrabajador)) {
            // set the owning side to null (unless already changed)
            if ($valoracionTrabajador->getTrabajador() === $this) {
                $valoracionTrabajador->setTrabajador(null);
            }
        }

        return $this;
    }
}
