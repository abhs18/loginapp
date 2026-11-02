Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  root "pages#home"
  get    "api/me",     to: "sessions#show"
  post   "api/login",  to: "sessions#create"
  delete "api/logout", to: "sessions#destroy"
end