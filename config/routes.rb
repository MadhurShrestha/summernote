Rails.application.routes.draw do
  root to: 'home#index'
  resources :posts
  resources :uploads, only: [:create, :destroy]
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
