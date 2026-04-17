<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class LogController extends AbstractController
{
    #[Route('/api/logs_debug', name: 'api_logs_debug', methods: ['GET'])]
    public function getLogs(): Response
    {
        $logPath = $this->getParameter('kernel.logs_dir') . '/dev.log';

        if (!file_exists($logPath)) {
            // Docker often pipes to stderr or stdout
            return new Response("No existe el fichero dev.log en $logPath. Probablemente los logs salen por consola de Docker.");
        }

        // Obtener las últimas 200 líneas del dev.log (sin shell_exec por precaución)
        $lines = file($logPath);
        if ($lines === false) {
            return new Response("No se puede leer el archivo de log.");
        }

        $lastLines = array_slice($lines, -200);
        return new Response('<pre>' . implode("", $lastLines) . '</pre>');
    }
}
