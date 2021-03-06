<?php

/**
 * @file
 * Contains \Drupal\webprofiler\StackMiddleware\WebprofilerMiddleware.
 */

namespace Drupal\webprofiler\StackMiddleware;

use Drupal\Core\Database\Database;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * Class WebprofilerMiddleware
 */
class WebprofilerMiddleware implements HttpKernelInterface {

  /**
   * The decorated kernel.
   *
   * @var \Symfony\Component\HttpKernel\HttpKernelInterface
   */
  protected $httpKernel;

  /**
   * Constructs a WebprofilerMiddleware object.
   *
   * @param \Symfony\Component\HttpKernel\HttpKernelInterface $http_kernel
   *   The decorated kernel.
   */
  public function __construct(HttpKernelInterface $http_kernel) {
    $this->httpKernel = $http_kernel;
  }

  /**
   * {@inheritdoc}
   */
  public function handle(Request $request, $type = self::MASTER_REQUEST, $catch = TRUE) {
    Database::startLog('webprofiler');

    return $this->httpKernel->handle($request, $type, $catch);
  }

}
