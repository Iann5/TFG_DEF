<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260120131948 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE cita (id INT AUTO_INCREMENT NOT NULL, fecha DATE NOT NULL, hora_inicio TIME NOT NULL, hora_fin TIME NOT NULL, tipo_cita VARCHAR(50) NOT NULL, estado VARCHAR(50) NOT NULL, usuario_id INT NOT NULL, trabajador_id INT NOT NULL, INDEX IDX_3E379A62DB38439E (usuario_id), INDEX IDX_3E379A62EC3656E (trabajador_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE cita_detalle (id INT AUTO_INCREMENT NOT NULL, descripcion_design LONGTEXT NOT NULL, imagen_referencia VARCHAR(255) DEFAULT NULL, tamano_cm VARCHAR(50) NOT NULL, precio_final DOUBLE PRECISION NOT NULL, cita_id INT NOT NULL, UNIQUE INDEX UNIQ_2A69220B1E011DDF (cita_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE estilo (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(255) NOT NULL, informacion LONGTEXT NOT NULL, imagen VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE linea_pedido (id INT AUTO_INCREMENT NOT NULL, cantidad INT NOT NULL, precio DOUBLE PRECISION NOT NULL, usuario_id INT NOT NULL, producto_id INT DEFAULT NULL, pedido_id INT DEFAULT NULL, INDEX IDX_183C3165DB38439E (usuario_id), INDEX IDX_183C31657645698E (producto_id), INDEX IDX_183C31654854653A (pedido_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE pack (id INT AUTO_INCREMENT NOT NULL, titulo VARCHAR(255) NOT NULL, descripcion LONGTEXT NOT NULL, imagen VARCHAR(255) NOT NULL, precio_original DOUBLE PRECISION NOT NULL, tipo_pack VARCHAR(50) NOT NULL, precio_oferta DOUBLE PRECISION DEFAULT NULL, stock INT NOT NULL, cantidad INT NOT NULL, fecha_subida DATETIME NOT NULL, creador_id INT NOT NULL, producto_id INT DEFAULT NULL, proyecto_id INT DEFAULT NULL, INDEX IDX_97DE5E2362F40C3D (creador_id), INDEX IDX_97DE5E237645698E (producto_id), INDEX IDX_97DE5E23F625D1BA (proyecto_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE pedido (id INT AUTO_INCREMENT NOT NULL, metodo_pago VARCHAR(50) NOT NULL, total DOUBLE PRECISION NOT NULL, fecha_compra DATETIME NOT NULL, usuario_id INT NOT NULL, INDEX IDX_C4EC16CEDB38439E (usuario_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE privacidad (id INT AUTO_INCREMENT NOT NULL, firma LONGTEXT NOT NULL, fecha_firma DATETIME NOT NULL, cita_id INT NOT NULL, usuario_id INT NOT NULL, UNIQUE INDEX UNIQ_A979AD8C1E011DDF (cita_id), INDEX IDX_A979AD8CDB38439E (usuario_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE producto (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(255) NOT NULL, descripcion LONGTEXT NOT NULL, imagen VARCHAR(255) NOT NULL, precio_original DOUBLE PRECISION NOT NULL, precio_oferta DOUBLE PRECISION DEFAULT NULL, stock INT NOT NULL, fecha_subida DATETIME NOT NULL, creador_id INT NOT NULL, INDEX IDX_A7BB061562F40C3D (creador_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE proyecto (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(255) NOT NULL, tipo VARCHAR(50) NOT NULL, imagen VARCHAR(255) NOT NULL, precio_original DOUBLE PRECISION NOT NULL, precio_oferta DOUBLE PRECISION DEFAULT NULL, fecha_subida DATETIME NOT NULL, autor_id INT NOT NULL, estilo_id INT NOT NULL, INDEX IDX_6FD202B914D45BBE (autor_id), INDEX IDX_6FD202B943798DA7 (estilo_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE trabajador (id INT AUTO_INCREMENT NOT NULL, descripcion LONGTEXT NOT NULL, tiempo_cm_min DOUBLE PRECISION NOT NULL, usuario_id_id INT NOT NULL, UNIQUE INDEX UNIQ_42157CDF629AF449 (usuario_id_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE trabajador_estilo (trabajador_id INT NOT NULL, estilo_id INT NOT NULL, INDEX IDX_A1D2EB82EC3656E (trabajador_id), INDEX IDX_A1D2EB8243798DA7 (estilo_id), PRIMARY KEY (trabajador_id, estilo_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, nombre VARCHAR(255) NOT NULL, apellidos VARCHAR(255) NOT NULL, dni VARCHAR(20) NOT NULL, telefono VARCHAR(20) NOT NULL, pais VARCHAR(100) NOT NULL, direccion VARCHAR(255) NOT NULL, provincia VARCHAR(100) NOT NULL, localidad VARCHAR(100) NOT NULL, cp VARCHAR(10) NOT NULL, foto_perfil VARCHAR(255) DEFAULT NULL, fecha_registro DATETIME NOT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE valoracion_producto (id INT AUTO_INCREMENT NOT NULL, estrellas INT NOT NULL, comentario LONGTEXT NOT NULL, fecha DATETIME NOT NULL, usuario_id INT NOT NULL, producto_id INT NOT NULL, INDEX IDX_BC6F2C94DB38439E (usuario_id), INDEX IDX_BC6F2C947645698E (producto_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE valoracion_proyecto (id INT AUTO_INCREMENT NOT NULL, estrellas INT NOT NULL, comentario LONGTEXT NOT NULL, fecha DATETIME NOT NULL, usuario_id INT NOT NULL, proyecto_id INT NOT NULL, INDEX IDX_74062838DB38439E (usuario_id), INDEX IDX_74062838F625D1BA (proyecto_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE valoracion_trabajador (id INT AUTO_INCREMENT NOT NULL, estrellas INT NOT NULL, comentario LONGTEXT NOT NULL, fecha DATETIME NOT NULL, usuario_id INT NOT NULL, trabajador_id INT NOT NULL, INDEX IDX_BB3607D7DB38439E (usuario_id), INDEX IDX_BB3607D7EC3656E (trabajador_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE cita ADD CONSTRAINT FK_3E379A62DB38439E FOREIGN KEY (usuario_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE cita ADD CONSTRAINT FK_3E379A62EC3656E FOREIGN KEY (trabajador_id) REFERENCES trabajador (id)');
        $this->addSql('ALTER TABLE cita_detalle ADD CONSTRAINT FK_2A69220B1E011DDF FOREIGN KEY (cita_id) REFERENCES cita (id)');
        $this->addSql('ALTER TABLE linea_pedido ADD CONSTRAINT FK_183C3165DB38439E FOREIGN KEY (usuario_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE linea_pedido ADD CONSTRAINT FK_183C31657645698E FOREIGN KEY (producto_id) REFERENCES producto (id)');
        $this->addSql('ALTER TABLE linea_pedido ADD CONSTRAINT FK_183C31654854653A FOREIGN KEY (pedido_id) REFERENCES pedido (id)');
        $this->addSql('ALTER TABLE pack ADD CONSTRAINT FK_97DE5E2362F40C3D FOREIGN KEY (creador_id) REFERENCES trabajador (id)');
        $this->addSql('ALTER TABLE pack ADD CONSTRAINT FK_97DE5E237645698E FOREIGN KEY (producto_id) REFERENCES producto (id)');
        $this->addSql('ALTER TABLE pack ADD CONSTRAINT FK_97DE5E23F625D1BA FOREIGN KEY (proyecto_id) REFERENCES proyecto (id)');
        $this->addSql('ALTER TABLE pedido ADD CONSTRAINT FK_C4EC16CEDB38439E FOREIGN KEY (usuario_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE privacidad ADD CONSTRAINT FK_A979AD8C1E011DDF FOREIGN KEY (cita_id) REFERENCES cita (id)');
        $this->addSql('ALTER TABLE privacidad ADD CONSTRAINT FK_A979AD8CDB38439E FOREIGN KEY (usuario_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE producto ADD CONSTRAINT FK_A7BB061562F40C3D FOREIGN KEY (creador_id) REFERENCES trabajador (id)');
        $this->addSql('ALTER TABLE proyecto ADD CONSTRAINT FK_6FD202B914D45BBE FOREIGN KEY (autor_id) REFERENCES trabajador (id)');
        $this->addSql('ALTER TABLE proyecto ADD CONSTRAINT FK_6FD202B943798DA7 FOREIGN KEY (estilo_id) REFERENCES estilo (id)');
        $this->addSql('ALTER TABLE trabajador ADD CONSTRAINT FK_42157CDF629AF449 FOREIGN KEY (usuario_id_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE trabajador_estilo ADD CONSTRAINT FK_A1D2EB82EC3656E FOREIGN KEY (trabajador_id) REFERENCES trabajador (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE trabajador_estilo ADD CONSTRAINT FK_A1D2EB8243798DA7 FOREIGN KEY (estilo_id) REFERENCES estilo (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE valoracion_producto ADD CONSTRAINT FK_BC6F2C94DB38439E FOREIGN KEY (usuario_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE valoracion_producto ADD CONSTRAINT FK_BC6F2C947645698E FOREIGN KEY (producto_id) REFERENCES producto (id)');
        $this->addSql('ALTER TABLE valoracion_proyecto ADD CONSTRAINT FK_74062838DB38439E FOREIGN KEY (usuario_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE valoracion_proyecto ADD CONSTRAINT FK_74062838F625D1BA FOREIGN KEY (proyecto_id) REFERENCES proyecto (id)');
        $this->addSql('ALTER TABLE valoracion_trabajador ADD CONSTRAINT FK_BB3607D7DB38439E FOREIGN KEY (usuario_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE valoracion_trabajador ADD CONSTRAINT FK_BB3607D7EC3656E FOREIGN KEY (trabajador_id) REFERENCES trabajador (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cita DROP FOREIGN KEY FK_3E379A62DB38439E');
        $this->addSql('ALTER TABLE cita DROP FOREIGN KEY FK_3E379A62EC3656E');
        $this->addSql('ALTER TABLE cita_detalle DROP FOREIGN KEY FK_2A69220B1E011DDF');
        $this->addSql('ALTER TABLE linea_pedido DROP FOREIGN KEY FK_183C3165DB38439E');
        $this->addSql('ALTER TABLE linea_pedido DROP FOREIGN KEY FK_183C31657645698E');
        $this->addSql('ALTER TABLE linea_pedido DROP FOREIGN KEY FK_183C31654854653A');
        $this->addSql('ALTER TABLE pack DROP FOREIGN KEY FK_97DE5E2362F40C3D');
        $this->addSql('ALTER TABLE pack DROP FOREIGN KEY FK_97DE5E237645698E');
        $this->addSql('ALTER TABLE pack DROP FOREIGN KEY FK_97DE5E23F625D1BA');
        $this->addSql('ALTER TABLE pedido DROP FOREIGN KEY FK_C4EC16CEDB38439E');
        $this->addSql('ALTER TABLE privacidad DROP FOREIGN KEY FK_A979AD8C1E011DDF');
        $this->addSql('ALTER TABLE privacidad DROP FOREIGN KEY FK_A979AD8CDB38439E');
        $this->addSql('ALTER TABLE producto DROP FOREIGN KEY FK_A7BB061562F40C3D');
        $this->addSql('ALTER TABLE proyecto DROP FOREIGN KEY FK_6FD202B914D45BBE');
        $this->addSql('ALTER TABLE proyecto DROP FOREIGN KEY FK_6FD202B943798DA7');
        $this->addSql('ALTER TABLE trabajador DROP FOREIGN KEY FK_42157CDF629AF449');
        $this->addSql('ALTER TABLE trabajador_estilo DROP FOREIGN KEY FK_A1D2EB82EC3656E');
        $this->addSql('ALTER TABLE trabajador_estilo DROP FOREIGN KEY FK_A1D2EB8243798DA7');
        $this->addSql('ALTER TABLE valoracion_producto DROP FOREIGN KEY FK_BC6F2C94DB38439E');
        $this->addSql('ALTER TABLE valoracion_producto DROP FOREIGN KEY FK_BC6F2C947645698E');
        $this->addSql('ALTER TABLE valoracion_proyecto DROP FOREIGN KEY FK_74062838DB38439E');
        $this->addSql('ALTER TABLE valoracion_proyecto DROP FOREIGN KEY FK_74062838F625D1BA');
        $this->addSql('ALTER TABLE valoracion_trabajador DROP FOREIGN KEY FK_BB3607D7DB38439E');
        $this->addSql('ALTER TABLE valoracion_trabajador DROP FOREIGN KEY FK_BB3607D7EC3656E');
        $this->addSql('DROP TABLE cita');
        $this->addSql('DROP TABLE cita_detalle');
        $this->addSql('DROP TABLE estilo');
        $this->addSql('DROP TABLE linea_pedido');
        $this->addSql('DROP TABLE pack');
        $this->addSql('DROP TABLE pedido');
        $this->addSql('DROP TABLE privacidad');
        $this->addSql('DROP TABLE producto');
        $this->addSql('DROP TABLE proyecto');
        $this->addSql('DROP TABLE trabajador');
        $this->addSql('DROP TABLE trabajador_estilo');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE valoracion_producto');
        $this->addSql('DROP TABLE valoracion_proyecto');
        $this->addSql('DROP TABLE valoracion_trabajador');
    }
}
