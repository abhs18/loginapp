class SessionsController < ApplicationController
  def show
    user = User.find_by(id: session[:user_id])
    user ? render(json: { email: user.email }) : head(:unauthorized)
  end

  def create
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      reset_session
      session[:user_id] = user.id
      render json: { email: user.email }
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def destroy
    reset_session
    head :no_content
  end
end