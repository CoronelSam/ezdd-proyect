import { createContext, useContext } from 'react';
import { createContextualCan } from '@casl/react';
import { definirAbilidades } from '../config/abilities';
import { useAuth } from '../hooks/useAuth';

/**
 * Context de habilidades CASL
 */
export const AbilityContext = createContext();

/**
 * Componente Can contextual para usar en JSX
 * Uso: <Can I="create" a="Producto">...</Can>
 */
export const Can = createContextualCan(AbilityContext.Consumer);

/**
 * Provider de habilidades CASL
 * Envuelve la aplicación y proporciona las habilidades basadas en el usuario actual
 */
export const AbilityProvider = ({ children }) => {
    const { usuario } = useAuth();
    
    // Definir las habilidades del usuario actual
    const habilidad = definirAbilidades(usuario);

    return (
        <AbilityContext.Provider value={habilidad}>
            {children}
        </AbilityContext.Provider>
    );
};

/**
 * Hook personalizado para acceder a las habilidades
 */
export const useAbility = () => {
    const context = useContext(AbilityContext);
    
    if (context === undefined) {
        throw new Error('useAbility debe usarse dentro de un AbilityProvider');
    }
    
    return context;
};
