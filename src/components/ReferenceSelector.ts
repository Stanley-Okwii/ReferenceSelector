import { Component, createElement } from "react";
// import "../ui/ReferenceSelector.scss";

export interface ReferenceSelectorProps {
    style?: object;
    readOnly: boolean;
    data: any;
    value: string;
    handleOnchange: () => void;
    id?: string;
}

export type referenceOptions = Array<{value: string, id: string}>;

export class ReferenceSelector extends Component<ReferenceSelectorProps> {
    private selectNode?: HTMLElement;

    constructor(props: ReferenceSelectorProps) {
        super(props);

        this.setRef = this.setRef.bind(this);
    }

    componentWillMount() {
        //
    }

    render() {
        return createElement("div", { className: "mx-referenceselector-input-wrapper" },
            createElement("select", {
                className: "form-control",
                onChange: this.props.handleOnchange,
                ref: this.setRef
            },
                this.createList(this.props.data)));
    }

    private createList(dropdownOptions: referenceOptions) {
        return dropdownOptions.map(dropOption =>
           createElement("option", { value: dropOption.id }, dropOption.value)
        );
    }

    public setRef(node: HTMLElement) {
        if (this.selectNode) {
            this.selectNode = node;
        }
    }
}
