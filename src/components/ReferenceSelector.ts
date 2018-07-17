import { Component, createElement } from "react";
import Select from "react-select";
// import "../ui/ReferenceSelector.scss";

export interface ReferenceSelectorProps {
    style?: object;
    readOnly: boolean;
    data: any;
    value: string;
    label: string;
    showLabel: "yes" | "no";
    selectedValue: referenceOption;
    handleOnchange: (selectedOption: any) => void;
    id?: string;
}
// tslint:disable-next-line:interface-over-type-literal
export type referenceOption = { value: string, label: string };

export class ReferenceSelector extends Component<ReferenceSelectorProps> {
    private selectNode?: HTMLElement;

    constructor(props: ReferenceSelectorProps) {
        super(props);

        this.setRef = this.setRef.bind(this);
    }

    render() {
        return createElement("div", { className: "reference-wrapper" },
            this.showLabel(),
            createElement(Select, {
                onChange: this.props.handleOnchange,
                options: this.props.data,
                ref: "list",
                value: this.props.selectedValue
            })
        );
    }

    private showLabel() {
        return this.props.showLabel ?
            createElement("label", { className: "control-label" }, this.props.label) :
            null;
    }

    public setRef(node: HTMLElement) {
        if (this.selectNode) {
            this.selectNode = node;
        }
    }
}
