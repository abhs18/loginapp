class User < ApplicationRecord
  has_secure_password
  normalizes :email, with: ->(e) { e.strip.downcase }

  validates :email, presence: true,
                    uniqueness: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP, message: "is not a valid email" }
  validates :password, length: { minimum: 8, maximum: 72 }, allow_nil: true
end