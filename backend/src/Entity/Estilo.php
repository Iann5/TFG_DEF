<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\EstiloRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EstiloRepository::class)]
#[ApiResource]
class Estilo
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nombre = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $informacion = null;

    #[ORM\Column(length: 255)]
    private ?string $imagen = null;

    /**
     * @var Collection<int, Trabajador>
     */
    #[ORM\ManyToMany(targetEntity: Trabajador::class, mappedBy: 'estilos')]
    private Collection $trabajadores;

    /**
     * @var Collection<int, Proyecto>
     */
    #[ORM\OneToMany(targetEntity: Proyecto::class, mappedBy: 'estilo')]
    private Collection $proyectos;

    public function __construct()
    {
        $this->trabajadores = new ArrayCollection();
        $this->proyectos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getInformacion(): ?string
    {
        return $this->informacion;
    }

    public function setInformacion(string $informacion): static
    {
        $this->informacion = $informacion;

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

    /**
     * @return Collection<int, Trabajador>
     */
    public function getTrabajadores(): Collection
    {
        return $this->trabajadores;
    }

    public function addTrabajadore(Trabajador $trabajadore): static
    {
        if (!$this->trabajadores->contains($trabajadore)) {
            $this->trabajadores->add($trabajadore);
            $trabajadore->addEstilo($this);
        }

        return $this;
    }

    public function removeTrabajadore(Trabajador $trabajadore): static
    {
        if ($this->trabajadores->removeElement($trabajadore)) {
            $trabajadore->removeEstilo($this);
        }

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
            $proyecto->setEstilo($this);
        }

        return $this;
    }

    public function removeProyecto(Proyecto $proyecto): static
    {
        if ($this->proyectos->removeElement($proyecto)) {
            // set the owning side to null (unless already changed)
            if ($proyecto->getEstilo() === $this) {
                $proyecto->setEstilo(null);
            }
        }

        return $this;
    }
}
