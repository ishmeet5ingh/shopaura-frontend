const InputField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder,
  required = false,
  minLength,
  icon 
}) => {
  return (
    <div className="mb-5">
      <label 
        htmlFor={name} 
        className="block text-gray-700 font-semibold mb-2"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className={`input-field ${icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  );
};

export default InputField;
