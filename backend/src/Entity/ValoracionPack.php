<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\ValoracionPackRepository;
use App\State\ValoracionPackProcessor;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ValoracionPackRepository::class)]
#[ApiFilter(SearchFilter::class, properties: ['pack' => 'exact'])]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(processor: ValoracionPackProcessor::class, security: "is_granted('ROLE_USER')"),
        new Patch(
            processor: ValoracionPackProcessor::class,
            security: "is_granted('ROLE_USER') and object.getUsuario() != null and object.getUsuario().getId() == user.getId()",
            denormalizationContext: ['groups' => ['valoracion_pack:patch']],
        ),
        new Delete(
            security: "is_granted('ROLE_USER') and object.getUsuario() != null and object.getUsuario().getId() == user.getId()",
        ),
    ],
    normalizationContext: ['groups' => ['valoracion_pack:read']],
    denormalizationContext: ['groups' => ['valoracion_pack:write']],
)]
class ValoracionPack
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['valoracion_pack:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['valoracion_pack:read'])]
    private ?User $usuario = null;

    #[ORM\ManyToOne(inversedBy: 'valoracionPacks')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['valoracion_pack:write'])]
    private ?Pack $pack = null;

    #[ORM\Column]
    #[Groups(['valoracion_pack:read', 'valoracion_pack:write', 'valoracion_pack:patch'])]
    private ?int $estrellas = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['valoracion_pack:read', 'valoracion_pack:write', 'valoracion_pack:patch'])]
    private ?string $comentario = null;

    #[ORM\Column]
    #[Groups(['valoracion_pack:read'])]
    private ?\DateTime $fecha = null;

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

    public function getPack(): ?Pack
    {
        return $this->pack;
    }

    public function setPack(?Pack $pack): static
    {
        $this->pack = $pack;

        return $this;
    }

    public function getEstrellas(): ?int
    {
        return $this->estrellas;
    }

    public function setEstrellas(int $estrellas): static
    {
        $this->estrellas = $estrellas;

        return $this;
    }

    public function getComentario(): ?string
    {
        return $this->comentario;
    }

    public function setComentario(string $comentario): static
    {
        $this->comentario = $comentario;

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
}
