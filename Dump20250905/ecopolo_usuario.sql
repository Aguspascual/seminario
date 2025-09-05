-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: ecopolo
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `Legajo` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(45) NOT NULL,
  `contrasena` varchar(45) NOT NULL,
  `Rol` varchar(45) NOT NULL DEFAULT 'usuario',
  `FechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UltimaVez` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Telefono` int NOT NULL,
  `Estado` tinyint NOT NULL DEFAULT '1',
  `Area_idArea` int NOT NULL,
  `nombre` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`Legajo`,`Area_idArea`),
  KEY `fk_Usuario_Area_idx` (`Area_idArea`),
  CONSTRAINT `fk_Usuario_Area` FOREIGN KEY (`Area_idArea`) REFERENCES `area` (`idArea`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (2,'bautista@mail.com','123456','Administrador','2025-08-15 20:55:45','2025-08-15 20:55:45',12344566,1,1,'Bautista Calvo'),(3,'pascu@mail.com','hola123','A','2025-08-15 23:17:34','2025-08-15 23:17:34',55995544,1,2,'Agustin Pascual'),(4,'sofia@mail.com','contrasena','B','2025-08-15 23:17:34','2025-08-15 23:17:34',98765432,1,3,'Sofia Lindon'),(5,'pedro@mail.com','ecopolo','C','2025-08-15 23:20:43','2025-08-15 23:20:43',22144355,1,2,'Pedro Moyano  '),(6,'fran@mail.com','123456','B','2025-08-16 07:15:08','2025-08-16 07:15:08',221343434,1,1,'Franco Jimenez'),(7,'giuseppin@gmail.com','1234','B','2025-09-02 10:04:14','2025-09-02 10:04:14',1234,1,2,'Giuseppin'),(8,'fedeborsi@gmail.com','ellocoborsi','administrador','2025-09-02 10:07:20','2025-09-02 10:07:20',91218,1,3,'Federico Borsi'),(9,'porti@mail.com','florenciovarela','Administrador','2025-09-02 10:55:26','2025-09-02 10:55:26',91218,1,1,'Franco Portillo');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-05 17:48:57
