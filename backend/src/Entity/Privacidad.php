<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PrivacidadRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PrivacidadRepository::class)]
#[ApiResource]
class Privacidad
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?Cita $cita = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $usuario = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $firma = null;

    #[ORM\Column]
    private ?\DateTime $fecha_firma = null;

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

    public function getUsuario(): ?User
    {
        return $this->usuario;
    }

    public function setUsuario(?User $usuario): static
    {
        $this->usuario = $usuario;

        return $this;
    }

    public function getFirma(): ?string
    {
        return $this->firma;
    }

    public function setFirma(string $firma): static
    {
        $this->firma = $firma;

        return $this;
    }

    public function getFechaFirma(): ?\DateTime
    {
        return $this->fecha_firma;
    }

    public function setFechaFirma(\DateTime $fecha_firma): static
    {
        $this->fecha_firma = $fecha_firma;

        return $this;
    }
}
