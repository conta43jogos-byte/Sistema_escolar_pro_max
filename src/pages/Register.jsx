import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { UserPlus, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    setLoading(true);
    try {
      await register({ email, password, name });
      navigate('/login');
    } catch (err) {
      setError(err.message || "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={UserPlus}
      title="Criar Conta"
      subtitle="Cadastre-se para usar o sistema"
      footer={
        <>
          Já tem uma conta?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Faça login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita sua senha"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar Conta"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
