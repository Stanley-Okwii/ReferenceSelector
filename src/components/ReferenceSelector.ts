import { Component, createElement } from "react";
import Select from "react-select";
import "../ui/ReferenceSelector.scss";

export interface ReferenceSelectorProps {
    style?: object;
    readOnly: boolean;
    data: any;
    value: string;
    label: string;
    showLabel: "yes" | "no";
    selectedValue: referenceOption;
    selectorType: selector;
    handleOnchange: (selectedOption: any) => void;
    handleClick: () => void;
    id?: string;
}
// tslint:disable-next-line:interface-over-type-literal
export type referenceOption = { value: string, label: string };

export type selector = "page" | "dropdown";

export class ReferenceSelector extends Component<ReferenceSelectorProps> {
    // private selectNode?: HTMLElement;

    render() {
        return createElement("div", { className: "widget-reference-selector-wrapper" },
            this.showLabel(),
            this.createSelector()
        );
    }

    private showLabel() {
        return this.props.showLabel ?
        createElement("div", { className: "div-wrapper" },
        createElement("label", { className: "control-label" }, this.props.label)) :
            null;
    }

    private createSelector() {
        if (this.props.selectorType === "dropdown") {
            return createElement("div", { className: "div-wrapper" }, createElement(Select, {
                onChange: this.props.handleOnchange,
                options: this.props.data,
                ref: "list",
                value: this.props.selectedValue
            }));
        } else if (this.props.selectorType === "page") {
            return createElement("div", { className: "div-wrapper" },
             createElement("div", {
                className: "mx-referenceselector",
                focusindex: "0"
            },
                createElement("button", {
                    className: "btn mx-button mx-referenceselector-select-button",
                    onClick: this.props.handleClick,
                    type: "button"
                },
                    createElement("span", {
                        className: "glyphicon glyphicon-share-alt"
                    })
                ), createElement("div", { className: "mx-referenceselector-input-wrapper" },
                    createElement("input", {
                        className: "form-control",
                        readonly: "readonly",
                        type: "text",
                        value: this.props.selectedValue.label
                    })
            )));
        }
    }
}
