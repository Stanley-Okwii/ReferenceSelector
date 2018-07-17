import { Component, createElement } from "react";
import { parseStyle } from "../utils/ContainerUtils";
import { FetchDataOptions, FetchedData, fetchData } from "../utils/data";
import { ReferenceSelector, referenceOption } from "./ReferenceSelector";

interface WrapperProps {
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    mxContext: mendix.lib.MxContext;
    style?: string;
    class?: string;
}

export interface ReferenceSelectorContainerProps extends WrapperProps {
    emptyOptionCaption: string;
    attribute: string;
    inputSelector: string;
    goToPage: string;
    source: "xpath"| "microflow" | "nanoflow";
    entityConstraint: string;
    sortOrder: "asc" | "des";
    dataEntity: string;
    microflow: string;
    nanoflow: Nanoflow;
    selectableAttribute: string;
    labelCaption: string;
    showLabel: string;
}

export interface ReferenceSelectorState {
    options: referenceOption[];
    selected: referenceOption;
    mxobject: mendix.lib.MxMetaObject | {};
    index: number;
}

export interface Nanoflow {
    nanoflow: object[];
    paramsSpec: { Progress: string };
}

export default class ReferenceSelectorContainer extends Component<ReferenceSelectorContainerProps, ReferenceSelectorState> {
    private subscriptionHandles: number[] = [];

    constructor(props: ReferenceSelectorContainerProps) {
        super(props);

        this.state = {
            index: 0,
            mxobject: {},
            options: [],
            selected: { value: "select" , label: this.props.emptyOptionCaption }
        };

        // readonly state: TranscriptState = { value: Value.create() };
        this.onChange = this.onChange.bind(this);
    }

    render() {
        return createElement(ReferenceSelector as any, {
            attribute: this.props.selectableAttribute,
            data: this.state.options,
            handleOnchange: this.onChange,
            label: this.props.labelCaption,
            selectedValue: this.state.selected,
            showLabel: this.props.showLabel,
            style: parseStyle(this.props.style)
        });
    }

    componentWillReceiveProps(newProps: ReferenceSelectorContainerProps) {
        if (newProps.mxObject !== this.props.mxObject) {
        this.retrieveOptions(newProps);
        this.resetSubscriptions(newProps.mxObject);
        }
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private setOptions = (item: Promise<FetchedData>) => {
        const dataOptions: referenceOption[] = [];

        Promise.all([ item ])
        .then((values) => {
            const mx = values[0].mxObjects;
            if (this.props.selectableAttribute && mx) {
                for (const mxOject of mx) {
                    dataOptions.push({ label: mxOject.get(this.props.selectableAttribute) as string, value: mxOject.getGuid() });
                }
            }
            this.setState({ options: dataOptions });
        });
    }

    private handleSubscriptions = () => {
        this.setState({ selected: this.getValue(this.props.mxObject) });
    }

    private getValue(mxObject: mendix.lib.MxObject) {
        return {
            label: mxObject.get(this.props.selectableAttribute) as string,
            value: mxObject.getGuid()
        };
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];

        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                attr: this.props.selectableAttribute,
                callback: this.handleSubscriptions,
                guid: mxObject.getGuid()
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: this.handleSubscriptions,
                guid: mxObject.getGuid()
            }));
        }
    }

    private onChange = (newValue: referenceOption) => {
        if (!this.props.mxObject) {
            return;
        }
        this.props.mxObject.set(this.props.selectableAttribute, newValue.label);
    }

    private retrieveOptions(props: ReferenceSelectorContainerProps) {
        const guid = props.mxObject.getGuid();
        const { dataEntity, entityConstraint, source, sortOrder, microflow , nanoflow } = props;
        const options = {
            constraint: entityConstraint,
            entity: dataEntity,
            guid,
            microflow,
            mxform: this.props.mxform,
            nanoflow,
            sortOrder,
            type: source
        };
        this.setOptions(fetchData(options as FetchDataOptions));
    }
}
