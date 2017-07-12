<?php

namespace App\Exceptions;

use Exception;

class TokenException extends \Exception
{
    public function __construct($message = "", $code = 0, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous); // TODO: Change the autogenerated stub
    }

    /**
     * @return boolean
     */
    public function isExpired()
    {
        return $this->getCode() === 1;
    }
}