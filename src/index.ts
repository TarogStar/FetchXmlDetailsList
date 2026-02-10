import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { DynamicDetailsList } from "./DynamicDetailsList";
import { TableColumnDefinition } from "@fluentui/react-components";

export class FetchXmlDetailsList implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private _primaryEntityName: string;
    private _fetchXML: string | null;
    private _columnLayout: Array<TableColumnDefinition<any>>;
    private _isDebugMode: boolean;
    private _baseEnvironmentUrl?: string;
    private _recordId: string;

     /** General */
     private _context: ComponentFramework.Context<IInputs>;

    /**
     * Empty constructor.
     */
    constructor() { }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary, 
        container: HTMLDivElement
    ): void {
        this.initVars(context);
    }

    private initVars(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;
        this._isDebugMode = false;
        
        if (this._context.parameters.DebugMode) {
            this._isDebugMode = this._context.parameters.DebugMode.raw == "1";
        }

        // If you want this to break every time you set isDebugMode to true
        //if (this._isDebugMode) { 
        //    debugger;  // eslint-disable-line no-debugger        
        //}

        
        // TODO: Validate the input parameters to make sure we get a friendly error instead of weird errors
        var fetchXML : string | null = this._context.parameters.FetchXml.raw; 
        var recordIdPlaceholder : string | null = this._context.parameters.RecordIdPlaceholder?.raw ?? "[RECORDID]";  
    
        // const recordIdLookupValue: ComponentFramework.EntityReference = this._context.parameters.RecordId.raw[0];

        // Other values if we need them
        let entityId = (<any>this._context.mode).contextInfo.entityId;
        // This breaks when you use the PCF Test Harness.  Neat!
        try{
            this._baseEnvironmentUrl = (<any>this._context)?.page?.getClientUrl();
        }
        catch(ex){
            this._baseEnvironmentUrl = "https://localhost";
        }
        var recordId : string = entityId; //this._context.parameters.RecordId.raw ?? currentRecordId;

        const overriddenRecordId = this._context.parameters.OverriddenRecordIdFieldName?.raw;
        if (overriddenRecordId && overriddenRecordId.length > 0 && overriddenRecordId[0]?.id) {
            recordId = overriddenRecordId[0].id;
            if (this._isDebugMode){
                console.log(`OverriddenRecordIdFieldName value used: ${recordId}.`)
            }
        }

        // Update FetchXml, replace Record Id Placeholder with an actual Id
        // Grab primary entity Name from FetchXml
        // Test harness always initially passes in "val", so we can skip the following
        if (fetchXML != null && fetchXML != "val") {
            fetchXML =  fetchXML.replace(/"/g, "'");
            this._primaryEntityName = this.getPrimaryEntityNameFromFetchXml(fetchXML);
            // Replace the placeholder     
            this._recordId = recordId;
            const recordIdPlaceholderValue = recordIdPlaceholder ?? "";
            const resolvedFetchXml = this.replacePlaceholderWithId(fetchXML, recordId, recordIdPlaceholderValue);
            const isGuid = (value: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value || "");
            const unresolvedPlaceholder = recordIdPlaceholderValue && resolvedFetchXml.includes(recordIdPlaceholderValue);

            if (!isGuid(recordId) || unresolvedPlaceholder) {
                this._fetchXML = null;
            } else {
                this._fetchXML = resolvedFetchXml;
            }
        }

        // Column Layout provides field ordering, names, and widths
        let columnLayoutJson = this._context.parameters.ColumnLayoutJson.raw;
        this._columnLayout = columnLayoutJson != null && columnLayoutJson != "val" ? JSON.parse(columnLayoutJson) : null;

        //this._currentPageNumber = 1;

        //var globalContext = Xrm.Utility.getGlobalContext();
        //var appUrl = globalContext.getCurrentAppUrl();

        // this blows up
        // this._container.style.overflow = "auto";
    }

    private replacePlaceholderWithId(fetchXML: string, recordId: string, recordIdPlaceholder: string) : string {
        if (recordId && recordIdPlaceholder) {
            if (fetchXML.indexOf(recordIdPlaceholder) > -1) {
                //return fetchXML.replace(recordIdPlaceholder, recordId); // only replaces first occurrence of string       
                return this.replaceAll(fetchXML, recordIdPlaceholder, recordId);
            }
        }
        return fetchXML;
    }

    // Replace ALL occurrences of a string
    private replaceAll(source: string, find: string, replace: string) : string{
        // eslint-disable-next-line no-useless-escape
        return source.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
    }
    
    private getPrimaryEntityNameFromFetchXml(fetchXml: string): string {
        let primaryEntityName: string = "";
        // @ts-ignore
        let filter = fetchXml.matchAll(/<entity name='(.*?)'>/g).next();
        if (filter && filter.value && filter.value[1]) {
            primaryEntityName = filter.value[1];
        }        
        return primaryEntityName;
    }
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        // debugger;  // eslint-disable-line no-debugger
        let props = {
            columns: this._columnLayout,
            primaryEntityName: this._primaryEntityName,
            fetchXml: this._fetchXML,
            isDebugMode: this._isDebugMode,
            context: context,
            baseD365Url: this._baseEnvironmentUrl,
            CustomButtonConfig: context.parameters.CustomButtonConfig?.raw,
            recordId: this._recordId,
            hideNewButton: context.parameters.HideNewButton?.raw === "1",
            hideRefreshButton: context.parameters.HideRefreshButton?.raw === "1",
            hideExportButton: context.parameters.HideExportButton?.raw === "1",
            hideBulkEditButton: context.parameters.HideBulkEditButton?.raw === "1"
        };
        return React.createElement(DynamicDetailsList, props);

        // TODO: Is it possible to support a grid without a columnlayout?
        // i.e. Create a default columnListLayout from the data
     
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return { };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
