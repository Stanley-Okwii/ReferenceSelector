import { Component, createElement } from "react";
import { parseStyle } from "../utils/ContainerUtils";
import { FetchDataOptions, fetchData } from "../utils/data";
import { ReferenceSelector, referenceOptions } from "./ReferenceSelector";

interface WrapperProps {
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
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
    SelectableAttribute: string;
}

export interface ReferenceSelectorState {
    options: referenceOptions;
    selectedOption: {value: string, id: string} | {};
    selected: string;
    mxobject: mendix.lib.MxMetaObject | {};
}

export interface Nanoflow {
    nanoflow: object[];
    paramsSpec: { Progress: string };
}

// tslint:disable-next-line:interface-over-type-literal
export type referenceOption = {value: string, id: string} | {};

export default class ReferenceSelectorContainer extends Component<ReferenceSelectorContainerProps, ReferenceSelectorState> {
    private subscriptionHandles: number[] = [];
    private attribute?: string;

    constructor(props: ReferenceSelectorContainerProps) {
        super(props);

        this.state = {
            mxobject: {},
            options: [],
            selected: "",
            selectedOption: ""
        };

        // readonly state: TranscriptState = { value: Value.create() };
        const t = this.props.attribute.split("/");
        // this._opts = [];
        this.attribute = t[2];
        this.onChange = this.onChange.bind(this);
    }

    render() {
        return createElement(ReferenceSelector as any, {
            attribute: this.props.attribute,
            data: this.state.options,
            handleOnchange: this.onChange,
            style: parseStyle(this.props.style)
        });
    }

    componentWillReceiveProps(newProps: ReferenceSelectorContainerProps) {
        this.resetSubscriptions(newProps.mxObject);
        // this.setState(this.getValue(newProps.mxObject)));
        const guid = newProps.mxObject.getGuid();
        const { dataEntity, entityConstraint, source, sortOrder, microflow , nanoflow } = newProps;
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
        this.applyOptions(fetchData(options as FetchDataOptions));
    }

    componentDidMount() {
        // tslint:disable-next-line:no-console
        console.log(this.props.SelectableAttribute);
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private applyOptions = (item: any) => {
        const values: referenceOptions = [];
        const noCaption: { value: string, id: string } = { value: this.props.emptyOptionCaption, id: "1" };

        Promise.all([ item ]).then((value: Array<{mxObjects: mendix.lib.MxObject[]}>) => {
            const mx = value[0].mxObjects;
            if (this.attribute) {
                for (const i of mx) {
                    values.push({ value: i.get(this.attribute) as string, id: i.getGuid() });
                }
                values.unshift(noCaption);
            }
            this.setState({ options: values });
        });
    }

    private handleSubscriptions = () => {
        this.setState({ selectedOption: this.getValue(this.props.mxObject) });
    }

    private getValue = (mxObject?: mendix.lib.MxObject): referenceOption => {
        return mxObject ? { value: mxObject.get(this.props.attribute) as string, id: mxObject.getGuid() } : {};
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];

        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                attr: this.props.attribute,
                callback: this.handleSubscriptions,
                guid: mxObject.getGuid()
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: this.handleSubscriptions,
                guid: mxObject.getGuid()
            }));
        }
    }

    private onChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedOption = event.target.value;
        const index = (event.target as any).options.selectedIndex;
        // tslint:disable-next-line:no-console
        // this.setState({ selected: selectedOption });
        // tslint:disable-next-line:no-console
        this.state.options.filter(item => item !== this.state.options[index]);
        this.state.options.unshift(this.state.options[index]);
        // tslint:disable-next-line:no-console
        console.log(this.state.options);
        this.updateAttribute(selectedOption, this.props.mxObject);
    }

    private updateAttribute = (value: string, mxObject?: mendix.lib.MxObject) => {
        if (mxObject) {
            mxObject.set(this.props.SelectableAttribute, value);
            const context = new mendix.lib.MxContext();
            context.setContext(mxObject.getEntity(), mxObject.getGuid());
        }
    }
}
