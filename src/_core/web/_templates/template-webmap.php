<?php

class TemplateWebmap {
    public $web;

    public function __construct(Web $web, SharedTemplateProvider $sharedTemplateProvider) {
        $this->web = $web;
        $this->templateProvider = $sharedTemplateProvider;
    }

    public function templateWebmap() {
        $text = $this->web->templateData['text'];
        return $this->templateProvider->sharedTemplateProvider(['text' => $text], '_core/web/_templates/template-webmap.html');
    }
}

$templateWebmap = new TemplateWebmap($web, $sharedTemplateProvider);