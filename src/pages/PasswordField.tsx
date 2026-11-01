interface PasswordFieldProps {
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  autoComplete: 'current-password' | 'new-password';
  label?: string;
}

export default function PasswordField({
  value,
  visible,
  onChange,
  onToggle,
  autoComplete,
  label = 'Password',
}: PasswordFieldProps) {
  return (
    <div className="auth-password-field">
      <label htmlFor="password">{label}</label>
      <div>
        <input
          id="password"
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={12}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}
