# AutoBooker Workspace

Plataforma fullstack de agendamento e gestão para estéticas automotivas, desenvolvida com React, TypeScript, Laravel e PostgreSQL.

---

# Sobre o Projeto

O AutoBooker é uma plataforma que conecta clientes e estéticas automotivas, permitindo agendamentos online, gerenciamento operacional da loja e acompanhamento completo dos serviços realizados.

O sistema possui dois ambientes principais (ate o momento):

* Cliente
* Lojista

Toda a aplicação utiliza integração real entre frontend, backend e banco de dados PostgreSQL.

---

# Tecnologias Utilizadas

## Frontend

* React
* TypeScript
* TailwindCSS
* React Router
* Context API

## Backend

* Laravel
* PHP
* Sanctum Authentication

## Banco de Dados

* PostgreSQL

---

# Estrutura do Projeto

```txt
AutobookerWorkspace/
├── autobooker-api/      # Backend Laravel
├── autobooker-front/    # Frontend React + TypeScript
```

---

# Funcionalidades

## Cliente

* Cadastro e autenticação
* Cadastro de veículos
* Visualização de estéticas automotivas
* Escolha de serviços
* Carrinho de agendamento
* Checkout completo
* Histórico de serviços
* Dashboard do cliente

## Lojista

* Dashboard operacional
* Gestão de serviços
* Agenda em tempo real
* Controle de status dos agendamentos
* Registro de despesas
* Perfil completo da loja
* Integração pública da estética para clientes

---

# Funcionalidades Implementadas

## Backend

* Laravel + PostgreSQL
* Sanctum Authentication
* Middleware de roles
* APIs REST
* CRUD de serviços
* CRUD de veículos
* CRUD de agendamentos
* Dashboard do lojista
* Perfil da loja
* Despesas operacionais

## Frontend

* Integração completa com APIs
* Carrinho global
* Checkout funcional
* Agenda dinâmica
* Histórico do cliente
* Dashboard do lojista
* Perfil dinâmico da loja
* Store Detail com dados reais

---

# Status do Projeto

Projeto em desenvolvimento ativo.

Atualmente o sistema possui:

* fluxo completo de agendamento
* integração frontend/backend
* persistência real de dados
* dashboards operacionais
* controle de serviços e agenda

---

# Como Executar o Projeto

## Backend

```bash
cd autobooker-api

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate

php artisan serve
```

---

## Frontend

```bash
cd autobooker-front-end-main

npm install

npm run dev
```

---

# Equipe

Projeto desenvolvido pela equipe AutoBooker.

---

# Observações

Este projeto foi desenvolvido para fins acadêmicos e evolução prática em arquitetura fullstack, APIs REST, React, Laravel e PostgreSQL.
