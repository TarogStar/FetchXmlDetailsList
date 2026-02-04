import { ICustomButtonConfig } from '../types';

/**
 * Loads a web resource script dynamically
 */
async function loadWebResource(webResourceName: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if ((window as any)[webResourceName.replace('.js', '').replace(/[^a-zA-Z0-9]/g, '_')]) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `../../WebResources/${webResourceName}`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load web resource: ${webResourceName}`));
        document.head.appendChild(script);
    });
}

/**
 * Opens a custom page with the specified configuration
 * Can either use the built-in navigation or load and call a web resource function
 */
export async function openCustomPage(
    config: ICustomButtonConfig,
    pcfContext: any,
    parentEntityId?: string,
    customData?: any
): Promise<void> {
    try {
        const formContext = pcfContext.mode?.contextInfo?.formContext || pcfContext;

        // If a web resource is specified, load it and call the function
        if (config.webResourceName && config.functionName) {
            await loadWebResource(config.webResourceName);

            // Get the function from the global scope
            const functionParts = config.functionName.split('.');
            let targetFunction = window as any;

            for (const part of functionParts) {
                targetFunction = targetFunction[part];
                if (!targetFunction) {
                    throw new Error(`Function ${config.functionName} not found in web resource ${config.webResourceName}`);
                }
            }

            // Call the function with the form context and custom page name
            await targetFunction(formContext, config.customPageName, customData);
            return;
        }

        // Fallback to built-in custom page navigation
        // Use the provided parent entity ID
        if (!parentEntityId) {
            await (window as any).Xrm.Navigation.openAlertDialog({
                text: "Unable to determine parent record ID for custom page navigation."
            });
            return;
        }

        // Use the provided entity ID (already cleaned)
        const entityId = parentEntityId;

        // Build page input for custom page
        const pageInput: any = {
            pageType: "custom",
            name: config.customPageName,
            entityName: formContext?.data?.entity?.getEntityName?.() || "opportunity", // default to opportunity
            recordId: entityId,
            data: customData
        };

        // Dialog options with defaults
        const navigationOptions: any = {
            target: 2, // Open as dialog
            height: { value: config.dialogHeight || 80, unit: "%" },
            width: { value: config.dialogWidth || 90, unit: "%" },
            position: 1, // Center
            title: config.dialogTitle || config.buttonText
        };

        await (window as any).Xrm.Navigation.navigateTo(pageInput, navigationOptions);
    } catch (e: any) {
        await (window as any).Xrm.Navigation.openAlertDialog({
            text: `An error occurred while opening the custom page: ${e?.message || e}`
        });
    }
}