# AutoBooker Workspace

Plataforma fullstack para gerenciamento e agendamento de serviços em estéticas automotivas, desenvolvida com React, TypeScript, Laravel e PostgreSQL.

---

# Sobre o Projeto

O AutoBooker é uma solução completa que conecta clientes e estéticas automotivas através de um marketplace digital.

A plataforma permite que clientes realizem agendamentos online, acompanhem seus serviços, participem de programas de fidelidade e adquiram produtos e pacotes promocionais.

Para os lojistas, o sistema oferece ferramentas de gestão operacional, controle de estoque, acompanhamento financeiro e gerenciamento completo dos serviços prestados.

---

# Tecnologias Utilizadas

## Frontend

* React
* TypeScript
* TailwindCSS
* React Router
* Context API
* Vite

## Backend

* Laravel 10
* PHP
* Laravel Sanctum
* API REST

## Banco de Dados

* PostgreSQL

## Metodologias

* Scrum
* Kanban

---

# Arquitetura

```txt
AutobookerWorkspace/
├── autobooker-api/            # Backend Laravel
├── autobooker-front-end-main/ # Frontend React + TypeScript
```

A comunicação entre frontend e backend ocorre através de APIs REST autenticadas utilizando Laravel Sanctum.

---

# Funcionalidades do Cliente

* Cadastro e autenticação
* Dashboard do cliente
* Cadastro de veículos
* Marketplace de estéticas automotivas
* Visualização de serviços disponíveis
* Visualização de produtos disponíveis
* Compra de pacotes promocionais
* Carrinho de compras
* Checkout integrado
* Histórico de agendamentos
* Programa de fidelidade
* Acompanhamento dos serviços realizados

---

# Funcionalidades do Lojista

* Dashboard operacional
* Agenda de serviços
* Controle de status dos agendamentos
* Cadastro de clientes
* Gestão de serviços
* Gestão de produtos
* Controle de estoque
* Movimentação de estoque
* Histórico de movimentações
* Gestão de pacotes promocionais
* Programa de fidelidade configurável
* Cadastro de recompensas
* Controle de despesas
* Perfil da loja
* Compartilhamento do link público da loja

---

# Funcionalidades Backend

* Autenticação com Sanctum
* Controle de permissões por Role
* CRUD de veículos
* CRUD de serviços
* CRUD de agendamentos
* CRUD de estoque
* CRUD de produtos
* CRUD de pacotes
* CRUD de clientes da loja
* Sistema de fidelidade
* Sistema de recompensas
* Dashboard do cliente
* Dashboard do lojista
* Perfil da loja
* Relacionamentos completos entre entidades

---

# Modelos Principais

* User
* Store
* Vehicle
* Service
* Appointment
* StockItem
* StockMovement
* Package
* LoyaltyPoint
* LoyaltyReward
* LoyaltyRedemption
* LoyaltySetting
* Expense

---

# Status do Projeto

## Concluído

### Cliente

* Concluído

### Lojista

* Concluído

## Em Desenvolvimento

### Painel Administrativo (Admin)

Funcionalidades planejadas:

* Gestão global de usuários
* Gestão global de lojas
* Aprovação e bloqueio de contas
* Relatórios administrativos
* Monitoramento da plataforma
* Indicadores gerais do sistema

---

# Como Executar o Projeto

## Backend

```bash
cd autobooker-api

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate

php artisan storage:link

php artisan serve  
```

## Caso queira popular o banco automaticamente use:

php artisan migrate:fresh --seed


## Frontend

```bash
cd autobooker-front-end-main

npm install

npm run dev
```

---

# Equipe

Projeto desenvolvido pela equipe AutoBooker como atividade acadêmica do curso de Sistemas de Informação.


# Licença

Projeto acadêmico desenvolvido para fins educacionais e de aprendizado prático em desenvolvimento Full Stack, APIs REST, React, Laravel e PostgreSQL.
