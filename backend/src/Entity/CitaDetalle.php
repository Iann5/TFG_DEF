<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\CitaDetalleRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CitaDetalleRepository::class)]
#[ApiResource]
class CitaDetalle
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?Cita $cita = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $descripcion_design = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $imagen_referencia = null;

    #[ORM\Column(length: 50)]
    private ?string $tamano_cm = null;

    #[ORM\Column]
    private ?float $precio_final = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCita(): ?Cita
    {
        return $this->cita;
    }

    public function setCita(Cita $cita): static
    {
        $this->cita = $cita;

        return $this;
    }

    public function getDescripcionDesign(): ?string
    {
        return $this->descripcion_design;
    }

    public function setDescripcionDesign(string $descripcion_design): static
    {
        $this->descripcion_design = $descripcion_design;

        return $this;
    }

    public function getImagenReferencia(): ?string
    {
        return $this->imagen_referencia;
    }

    public function setImagenReferencia(?string $imagen_referencia): static
    {
        $this->imagen_referencia = $imagen_referencia;

        return $this;
    }

    public function getTamanoCm(): ?string
    {
        return $this->tamano_cm;
    }

    public function setTamanoCm(string $tamano_cm): static
    {
        $this->tamano_cm = $tamano_cm;

        return $this;
    }

    public function getPrecioFinal(): ?float
    {
        return $this->precio_final;
    }

    public function setPrecioFinal(float $precio_final): static
    {
        $this->precio_final = $precio_final;

        return $this;
    }
}
